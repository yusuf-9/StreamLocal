/**
 * Sets up the left sidebar toggle functionality
 * @param sidebar The sidebar element
 * @param toggleButton The button to toggle the sidebar
 */
export function setupLeftSidebar(sidebar: HTMLElement, toggleButton: HTMLElement): void {
  toggleButton.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.contains('w-0');
    
    if (isCollapsed) {
      // Expand
      sidebar.classList.remove('w-0');
      sidebar.classList.add('w-64');
      toggleButton.style.left = '16rem'; // 64 * 0.25 = 16rem
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      `;
    } else {
      // Collapse
      sidebar.classList.remove('w-64');
      sidebar.classList.add('w-0');
      toggleButton.style.left = '0';
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      `;
    }
  });
}

/**
 * Sets up the right sidebar toggle functionality
 * @param sidebar The sidebar element
 * @param toggleButton The button to toggle the sidebar
 */
export function setupRightSidebar(sidebar: HTMLElement, toggleButton: HTMLElement): void {
  toggleButton.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.contains('w-0');
    
    if (isCollapsed) {
      // Expand
      sidebar.classList.remove('w-0');
      sidebar.classList.add('w-64');
      toggleButton.style.right = '16rem'; // 64 * 0.25 = 16rem
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      `;
    } else {
      // Collapse
      sidebar.classList.remove('w-64');
      sidebar.classList.add('w-0');
      toggleButton.style.right = '0';
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      `;
    }
  });
} 