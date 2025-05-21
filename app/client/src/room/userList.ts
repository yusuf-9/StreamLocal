import type { User } from './types';

/**
 * Renders the list of users in the sidebar
 * @param users Array of users to render
 * @param container DOM element to render users into
 */
export function renderUserList(users: User[], container: HTMLElement): void {
  container.innerHTML = '';
  
  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.className = 'flex items-center p-3 rounded-lg hover:bg-[var(--bg-input)] transition-colors cursor-pointer';
    
    // Status indicator
    let statusIndicator = '';
    if (user.status === 'online') {
      statusIndicator = `<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-card)]"></div>`;
    } else if (user.status === 'speaking') {
      statusIndicator = `
        <div class="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center space-x-0.5">
          <div class="w-0.5 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
          <div class="w-0.5 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
          <div class="w-0.5 h-4 bg-indigo-400 rounded-full animate-pulse"></div>
        </div>
      `;
    }
    
    userElement.innerHTML = `
      <div class="relative mr-3">
        <div class="w-10 h-10 ${user.color} rounded-full flex items-center justify-center text-white font-medium">
          ${user.avatar}
        </div>
        ${statusIndicator}
      </div>
      <div class="flex-grow">
        <div class="font-medium">${user.name}</div>
      </div>
    `;
    
    container.appendChild(userElement);
  });
} 