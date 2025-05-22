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
});