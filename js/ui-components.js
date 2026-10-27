export function initUIComponents() {
    /* Check for clicks */
    document.addEventListener('click', (e) => {
        /* Square-toggle buttons */
        if (e.target.matches('.square-toggle')) {
            // Toggle state
            const isCurrentlyActive = e.target.getAttribute('data-active') === 'true';
            const newState = !isCurrentlyActive;
            
            // Visual feedback
            e.target.setAttribute('data-active', newState.toString());
    
            // Custom event "toggleChange"
            const toggleEvent = new CustomEvent('toggleChange', { 
                detail: { isActive: newState } 
            });
            e.target.dispatchEvent(toggleEvent);
        }
    });
}
