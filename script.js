document.addEventListener('DOMContentLoaded', () => {
    const lineBackground = document.querySelector('.line-background');
    const allLines = [];
    const numberOfLines = 100;
    const maxLineHeight = 100;
    const minLineHeight = 30;
    const influenceRadius = 150;

    for (let i = 0; i < numberOfLines; i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        lineBackground.appendChild(line);
        allLines.push(line);
    }

    function updateLineHeights(mouseX) {
        if (!mouseX) return;

        const lineBackgroundRect = lineBackground.getBoundingClientRect();

        allLines.forEach(line => {
            const lineRect = line.getBoundingClientRect();
            const lineCenterX = lineRect.left + (lineRect.width / 2);

            const distance = Math.abs(mouseX - lineCenterX);

            let newHeight;
            if (distance < influenceRadius) {
                const normalizedDistance = distance / influenceRadius;
                newHeight = minLineHeight + (maxLineHeight - minLineHeight) * normalizedDistance;
            } else {
                newHeight = maxLineHeight;
            }

            newHeight = Math.max(minLineHeight, Math.min(maxLineHeight, newHeight));

            line.style.height = `${newHeight}%`;
        });
    }

    lineBackground.addEventListener('mousemove', (event) => {
        const mouseX = event.clientX;
        updateLineHeights(mouseX);
    });

    lineBackground.addEventListener('mouseleave', () => {
        allLines.forEach(line => {
            line.style.height = `${maxLineHeight}%`;
        });
    });

    window.addEventListener('resize', () => {
        lineBackground.innerHTML = '';
        allLines.length = 0;

        for (let i = 0; i < numberOfLines; i++) {
            const line = document.createElement('div');
            line.classList.add('line');
            lineBackground.appendChild(line);
            allLines.push(line);
        }
    });

    const discordUserId = '1302298138995982397';
    const statusLabel = document.querySelector('.status-label');
    const statusDescription = document.querySelector('.status-description');
    const statusImage = document.querySelector('.status-box img');

    const defaultStatusLabel = "Status";
    const defaultStatusDescription = "Offline or no activity";
    const defaultStatusImageSrc = "https://cdn.discordapp.com/avatars/1302298138995982397/ecf21d27588f38ce320e9f790dcceccb?size=1024";

    function updateStatusDisplay(label, description, imageUrl) {
        statusLabel.textContent = label;
        statusDescription.textContent = description;
        statusImage.src = imageUrl;
    }

    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    ws.onopen = () => {
        ws.send(JSON.stringify({
            op: 2,
            d: {
                subscribe_to_ids: [discordUserId]
            }
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.op === 0 && (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE')) {
            const presence = data.d;

            if (presence && presence.listening_to_spotify) {
                const spotify = presence.spotify;
                updateStatusDisplay(
                    'Listening to Spotify',
                    `${spotify.artist} - ${spotify.song}`,
                    `https://i.scdn.co/image/${spotify.album_art_url.split(':').pop()}`
                );
            } else if (presence && presence.activities && presence.activities.length > 0) {
                const activity = presence.activities.find(act => act.type === 0 || act.type === 1 || act.type === 2 || act.type === 4);
                if (activity) {
                    let activityLabel = 'Activity';
                    let activityDescription = activity.name;
                    let activityImageUrl = defaultStatusImageSrc;

                    if (activity.details) {
                        activityDescription += `: ${activity.details}`;
                    }
                    if (activity.state) {
                        activityDescription += ` (${activity.state})`;
                    }

                    if (activity.assets && activity.assets.large_image) {
                        const assetId = activity.assets.large_image;
                        activityImageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${assetId}.png`;
                    } else if (activity.assets && activity.assets.small_image) {
                         const assetId = activity.assets.small_image;
                         activityImageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${assetId}.png`;
                    }

                    if (activity.type === 4) {
                        activityLabel = "My Status";
                        activityDescription = activity.state || "No custom status set";
                    }

                    updateStatusDisplay(activityLabel, activityDescription, activityImageUrl);
                } else {
                    updateStatusDisplay(defaultStatusLabel, defaultStatusDescription, defaultStatusImageSrc);
                }
            } else if (presence && presence.discord_status) {
                let statusText;
                switch (presence.discord_status) {
                    case 'online':
                        statusText = 'Online';
                        break;
                    case 'idle':
                        statusText = 'Idle';
                        break;
                    case 'dnd':
                        statusText = 'Do Not Disturb';
                        break;
                    case 'offline':
                    default:
                        statusText = 'Offline';
                        break;
                }
                updateStatusDisplay('Discord Status', statusText, defaultStatusImageSrc);
            } else {
                updateStatusDisplay(defaultStatusLabel, defaultStatusDescription, defaultStatusImageSrc);
            }
        }
    };

    ws.onclose = () => {
        updateStatusDisplay(defaultStatusLabel, "Disconnected from Lanyard", defaultStatusImageSrc);
    };

    ws.onerror = (error) => {
        updateStatusDisplay(defaultStatusLabel, "Error fetching status", defaultStatusImageSrc);
    };
});