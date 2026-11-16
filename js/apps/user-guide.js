/* Auxiliary function to sort the items in the Table of Contents */
function sortTOC() {
    const container = document.querySelector('.toc-list');
    if (!container) return;

    const tocItems = Array.from(container.querySelectorAll('.toc-item'));

    tocItems.sort((a, b) => {
        const nameA = a.textContent.trim().toLowerCase();
        const nameB = b.textContent.trim().toLowerCase();
        return nameA.localeCompare(nameB);
    });

    tocItems.forEach(item => container.appendChild(item));
}

export function initUserGuide() {
    const tocItems = document.querySelectorAll('.toc-item');
    const guideSection = document.querySelectorAll('.guide-section');

    if (tocItems.length === 0) return;

    sortTOC();

    tocItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove 'active' class from all items and sections
            tocItems.forEach(i => i.classList.remove('active'));
            guideSection.forEach(s => s.classList.remove('active'));

            // Add 'active' to the clicked item
            item.classList.add('active');

            // Get target section and activate it
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.classList.add('active');
            }

        });
    });
}