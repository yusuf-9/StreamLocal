import { users } from './data';
import { renderUserList } from './userList';
import { setupLeftSidebar, setupRightSidebar } from './sidebar';
import { setupVideoPlayer } from './videoPlayer';

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const leftSidebar = document.getElementById('leftSidebar') as HTMLDivElement;
  const rightSidebar = document.getElementById('rightSidebar') as HTMLDivElement;
  const middleContent = document.getElementById('middleContent') as HTMLDivElement;
  const toggleLeftSidebar = document.getElementById('toggleLeftSidebar') as HTMLButtonElement;
  const toggleRightSidebar = document.getElementById('toggleRightSidebar') as HTMLButtonElement;
  const userList = document.getElementById('userList') as HTMLDivElement;

  console.log(leftSidebar, rightSidebar, middleContent, toggleLeftSidebar, toggleRightSidebar, userList);

  // Set up sidebar toggle functionality
  setupLeftSidebar(leftSidebar, toggleLeftSidebar);
  setupRightSidebar(rightSidebar, toggleRightSidebar);
  
  // Set up video player functionality
  setupVideoPlayer();

  // Initialize room data from sessionStorage
  const initializeRoom = () => {
    const roomName = sessionStorage.getItem('roomName') || 'Unknown Room';
    const userName = sessionStorage.getItem('userName') || 'Anonymous';
    
    // You can use these values to populate your UI elements when needed
    console.log(`Room: ${roomName}, User: ${userName}`);
    
    // Render the user list
    renderUserList(users, userList);
  };

  initializeRoom();
});
