import store from "./store";
import { notyf } from "./index";

const userColorGradients = [
  "from-blue-500 to-purple-500",
  "from-green-500 to-teal-500",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
  "from-red-500 to-pink-500",
  "from-teal-500 to-cyan-500",
  "from-purple-500 to-indigo-500",
  "from-orange-500 to-red-500",
  "from-cyan-500 to-blue-500",
];

function getColorGradient(index: number): string {
  return userColorGradients[index % userColorGradients.length];
}

export function initializeRoomUI() {
  // Initialize DOM elements
  const elements = {
    leftSidebar: document.getElementById("leftSidebar")!,
    rightSidebar: document.getElementById("rightSidebar")!,
    toggleLeft: document.getElementById("toggleLeft")!,
    toggleRight: document.getElementById("toggleRight")!,
    floatingLeftToggle: document.getElementById("floatingLeftToggle")!,
    floatingRightToggle: document.getElementById("floatingRightToggle")!,
    roomNameText: document.getElementById("roomName")!,
    roomMembersCount: document.getElementById("roomMembersCount")!,
    roomUsersList: document.getElementById("roomUsersList")!,
    chatMessages: document.getElementById("chatMessages")!,
    shareButton: document.getElementById("shareButton")!,
  };

  // Initialize mobile state
  store.isMobile = window.innerWidth < 1024;
  if (store.isMobile) {
    store.isLeftSidebarOpen = true;
    store.isRightSidebarOpen = true;
  }

  // Update layout function
  function updateLayout(): void {
    if (store.isMobile) {
      // Mobile layout
      if (store.isLeftSidebarOpen) {
        elements.leftSidebar.classList.add("sidebar-mobile");
        elements.leftSidebar.classList.remove("open");
        elements.floatingLeftToggle.classList.remove("hidden");
      } else {
        elements.leftSidebar.classList.add("sidebar-mobile", "open");
        elements.floatingLeftToggle.classList.add("hidden");
      }

      if (store.isRightSidebarOpen) {
        elements.rightSidebar.classList.add("sidebar-mobile-right");
        elements.rightSidebar.classList.remove("open");
        elements.floatingRightToggle.classList.remove("hidden");
      } else {
        elements.rightSidebar.classList.add("sidebar-mobile-right", "open");
        elements.floatingRightToggle.classList.add("hidden");
      }

      // Add overlay when sidebar is open
      if (!store.isLeftSidebarOpen || !store.isRightSidebarOpen) {
        if (!document.getElementById("mobileOverlay")) {
          const overlay = document.createElement("div");
          overlay.id = "mobileOverlay";
          overlay.className = "fixed inset-0 bg-black/50 z-30 lg:hidden";
          overlay.addEventListener("click", () => {
            store.isLeftSidebarOpen = true;
            store.isRightSidebarOpen = true;
            updateLayout();
          });
          document.body.appendChild(overlay);
        }
      } else {
        const overlay = document.getElementById("mobileOverlay");
        if (overlay) overlay.remove();
      }
    } else {
      // Desktop layout
      elements.leftSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");
      elements.rightSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");

      if (store.isLeftSidebarOpen) {
        elements.leftSidebar.style.width = "0px";
        elements.leftSidebar.style.minWidth = "0px";
        elements.leftSidebar.style.overflow = "hidden";
        elements.floatingLeftToggle.classList.remove("hidden");
      } else {
        elements.leftSidebar.style.width = "320px";
        elements.leftSidebar.style.minWidth = "320px";
        elements.leftSidebar.style.overflow = "visible";
        elements.floatingLeftToggle.classList.add("hidden");
      }

      if (store.isRightSidebarOpen) {
        elements.rightSidebar.style.width = "0px";
        elements.rightSidebar.style.minWidth = "0px";
        elements.rightSidebar.style.overflow = "hidden";
        elements.floatingRightToggle.classList.remove("hidden");
      } else {
        elements.rightSidebar.style.width = "320px";
        elements.rightSidebar.style.minWidth = "320px";
        elements.rightSidebar.style.overflow = "visible";
        elements.floatingRightToggle.classList.add("hidden");
      }

      // Remove mobile overlay
      const overlay = document.getElementById("mobileOverlay");
      if (overlay) overlay.remove();
    }
  }

  // Toggle functions
  function toggleLeftSidebar(): void {
    store.isLeftSidebarOpen = !store.isLeftSidebarOpen;
    updateLayout();

    if (!store.isMobile) {
      // Update arrow for desktop
      if (store.isLeftSidebarOpen) {
        elements.toggleLeft.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    `;
      } else {
        elements.toggleLeft.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    `;
      }
    }
  }

  function toggleRightSidebar(): void {
    store.isRightSidebarOpen = !store.isRightSidebarOpen;
    updateLayout();

    if (!store.isMobile) {
      // Update arrow for desktop
      if (store.isRightSidebarOpen) {
        elements.toggleRight.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    `;
      } else {
        elements.toggleRight.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    `;
      }
    }
  }

  // Add share link functionality
  function handleShare() {
    const url = new URL(window.location.href);
    const roomId = url.searchParams.get("id");
    const baseUrl = url.origin.replace("/room.html", "");
    const inviteLink = `${baseUrl}?id=${roomId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        notyf.success({
          message: "Invite link copied to clipboard!",
          duration: 2000,
          dismissible: true,
          position: {
            x: "center",
            y: "top",
          },
        });
      })
      .catch(err => {
        console.error("Failed to copy link:", err);
        notyf.error({
          message: "Failed to copy link to clipboard",
          duration: 2000,
          dismissible: true,
          position: {
            x: "center",
            y: "top",
          },
        });
      });
  }

  elements.shareButton.addEventListener("click", handleShare);

  // Set up event listeners
  window.addEventListener("resize", () => {
    store.isMobile = window.innerWidth < 1024;
    updateLayout();
  });

  elements.toggleLeft.addEventListener("click", toggleLeftSidebar);
  elements.toggleRight.addEventListener("click", toggleRightSidebar);
  elements.floatingLeftToggle.addEventListener("click", toggleLeftSidebar);
  elements.floatingRightToggle.addEventListener("click", toggleRightSidebar);

  // Initialize layout
  updateLayout();
  updateUsersInLeftSidebar();
  updateRightSidebarContent(elements.chatMessages);

  // Update cleanup function
  return () => {
    window.removeEventListener("resize", updateLayout);
    elements.toggleLeft.removeEventListener("click", toggleLeftSidebar);
    elements.toggleRight.removeEventListener("click", toggleRightSidebar);
    elements.floatingLeftToggle.removeEventListener("click", toggleLeftSidebar);
    elements.floatingRightToggle.removeEventListener("click", toggleRightSidebar);
    elements.shareButton.removeEventListener("click", handleShare);
    const overlay = document.getElementById("mobileOverlay");
    if (overlay) overlay.remove();
  };
}

export function updateUsersInLeftSidebar() {
  const roomNameText = document.getElementById("roomName");
  const roomMembersCount = document.getElementById("roomMembersCount");
  const roomUsersList = document.getElementById("roomUsersList");

  if (!roomNameText || !roomMembersCount || !roomUsersList) return;

  roomNameText.textContent = store.room.name;
  roomMembersCount.textContent = `${store.room.members.length} participant${
    store.room.members.length === 1 ? "" : "s"
  }`;

  roomUsersList.innerHTML = store.room.members
    .map((member, index) => {
      const colorGradient = getColorGradient(index % userColorGradients.length);
      const isUserActive = member.socketId.length > 0;
      return `
          <div class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
            <div class="relative">
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-r ${colorGradient} flex items-center justify-center text-white font-medium"
              >
                ${member.userName[0]}
              </div>
              <div
                class="absolute -bottom-1 -right-1 w-3 h-3 ${
                  isUserActive ? "bg-green-500" : "bg-gray-500"
                } border-2 border-gray-800 rounded-full"
              ></div>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">${member.userName}</p>
              <p class="text-xs text-gray-400">${member.isHost ? "Host" : ""}</p>
            </div>
            ${
              isUserActive
                ? `
            <div class="audio-bars">
              <div
                class="audio-bar"
                style="height: 8px"
              ></div>
              <div
                class="audio-bar"
                style="height: 12px"
              ></div>
              <div
                class="audio-bar"
                style="height: 6px"
              ></div>
              <div
                class="audio-bar"
                style="height: 10px"
              ></div>
            </div>
            `
                : ""
            }
          </div>
          `;
    })
    .join("");
}

export function updateRightSidebarContent(chatMessagesElement: HTMLElement) {
  if (!store.room.messages.length) {
    chatMessagesElement.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <p class="text-gray-500">No messages yet</p>
      </div>
    `;
    return;
  }

  const messages = store.room.messages
    .map(message => {
      const senderIndex = store.room.members.findIndex(member => member.id === message.senderId);
      const sender = store.room.members[senderIndex];
      const colorGradient = getColorGradient(senderIndex % userColorGradients.length);
      return `
        <div class="chat-message">
          <div class="flex items-start space-x-3">
             <div class="relative">
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-r ${colorGradient} flex items-center justify-center text-white font-medium"
              >
                ${sender?.userName[0]}
              </div>
              </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-blue-400">${sender?.userName}</span>
                <span class="text-xs text-gray-500">${formatMessageTimestamp(message.createdAt)}</span>
              </div>
              <p class="text-sm text-gray-300 mt-1">${message.content}</p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  chatMessagesElement.innerHTML = messages;
  
  // Scroll to the bottom of the chat messages
  chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

function formatMessageTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (diffDays === 0) {
    // Today
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    // Yesterday
    return `Yesterday at ${timeStr}`;
  } else {
    // Format date as MM/DD/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year} at ${timeStr}`;
  }
}

export function updateChatMessagesUI() {
  const chatMessagesElement = document.getElementById("chatMessages");
  if (chatMessagesElement) {
    updateRightSidebarContent(chatMessagesElement);
  }
}
