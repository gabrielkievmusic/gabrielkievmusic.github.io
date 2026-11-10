export function initUserGuide() {
    const tocItems = document.querySelectorAll('.toc-item');
    const guideSection = document.querySelectorAll('.guide-section');

    if (tocItems.length === 0) return;

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