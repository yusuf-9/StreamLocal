import { Notyf } from "notyf";
import Store from "./store";
import type { Member, Message } from "./types";

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

export default class UIManager {
  private store: Store;
  private notyf: Notyf;
  private notificationDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastNotificationTime = 0;
  private readonly DEBOUNCE_DELAY = 500;

  constructor(store: Store, notyf: Notyf) {
    this.store = store;
    this.notyf = notyf;
  }

  public initialize() {
    this.initializeRoomUI();
    this.updateUsersList();
    this.updateChatMessages();
  }

  private initializeRoomUI() {
    this.removeLoadingOverlay();

    const elements = this.getUIElements();
    this.store.setMobile(window.innerWidth < 1024);
    this.updateLayout();

    // Set up event listeners
    window.addEventListener("resize", () => {
      this.store.setMobile(window.innerWidth < 1024);
      this.updateLayout();
    });

    elements.toggleLeft.addEventListener("click", () => {
      this.store.toggleLeftSidebar();
      this.updateLayout();
    });
    elements.toggleRight.addEventListener("click", () => {
      this.store.toggleRightSidebar();
      this.updateLayout();
    });
    elements.floatingLeftToggle.addEventListener("click", () => {
      this.store.toggleLeftSidebar();
      this.updateLayout();
    });
    elements.floatingRightToggle.addEventListener("click", () => {
      this.store.toggleRightSidebar();
      this.updateLayout();
    });
  }

  public getUIElements() {
    return {
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
      shareControlBtn: document.getElementById("shareControlBtn")!,
      endCallControlBtn: document.getElementById("endCallControlBtn")!,
      chatForm: document.getElementById("chatForm")!,
      chatInput: document.getElementById("chatInput")!,
      muteControlBtn: document.getElementById("muteControlBtn")!,
      joinAudioChatControlBtn: document.getElementById("joinAudioChatControlBtn")!,
      joinAudioChatControlBtnHoverText: document.getElementById("joinAudioChatControlBtnHoverText")!,
      streamScreenControlBtn: document.getElementById("streamScreenControlBtn")!,
      streamScreenControlBtnHoverText: document.getElementById("streamScreenControlBtnHoverText")!,
      streamVideoFileControlBtn: document.getElementById("streamVideoFileControlBtn")!,
      emptyVideoContainer: document.getElementById("emptyVideoContainer")!,
      videoPlayerContainer: document.getElementById("videoPlayerContainer")!,
      videoPlayer: document.getElementById("videoPlayer")!,
    };
  }

  private updateLayout() {
    const elements = this.getUIElements();
    const { isMobile, isLeftSidebarOpen, isRightSidebarOpen } = this.store;

    if (isMobile) {
      this.handleMobileLayout(elements, isLeftSidebarOpen, isRightSidebarOpen);
    } else {
      this.handleDesktopLayout(elements, isLeftSidebarOpen, isRightSidebarOpen);
    }
  }

  private handleMobileLayout(
    elements: ReturnType<typeof this.getUIElements>,
    isLeftSidebarOpen: boolean,
    isRightSidebarOpen: boolean
  ): void {
    // Mobile layout
    if (isLeftSidebarOpen) {
      elements.leftSidebar.classList.add("sidebar-mobile");
      elements.leftSidebar.classList.remove("open");
      elements.floatingLeftToggle.classList.remove("hidden");
    } else {
      elements.leftSidebar.classList.add("sidebar-mobile", "open");
      elements.floatingLeftToggle.classList.add("hidden");
    }

    if (isRightSidebarOpen) {
      elements.rightSidebar.classList.add("sidebar-mobile-right");
      elements.rightSidebar.classList.remove("open");
      elements.floatingRightToggle.classList.remove("hidden");
    } else {
      elements.rightSidebar.classList.add("sidebar-mobile-right", "open");
      elements.floatingRightToggle.classList.add("hidden");
    }

    // Add overlay when sidebar is open
    if (!isLeftSidebarOpen || !isRightSidebarOpen) {
      if (!document.getElementById("mobileOverlay")) {
        const overlay = document.createElement("div");
        overlay.id = "mobileOverlay";
        overlay.className = "fixed inset-0 bg-black/50 z-30 lg:hidden";
        overlay.addEventListener("click", () => {
          this.store.setMobileLeftSidebarOpen(true);
          this.store.setMobileRightSidebarOpen(true);
          this.updateLayout();
        });
        document.body.appendChild(overlay);
      }
    } else {
      const overlay = document.getElementById("mobileOverlay");
      if (overlay) overlay.remove();
    }
  }

  private handleDesktopLayout(
    elements: ReturnType<typeof this.getUIElements>,
    isLeftSidebarOpen: boolean,
    isRightSidebarOpen: boolean
  ): void {
    // Desktop layout
    elements.leftSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");
    elements.rightSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");

    if (isLeftSidebarOpen) {
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

    if (isRightSidebarOpen) {
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

  public updateUsersList() {
    const elements = this.getUIElements();
    if (!elements.roomNameText || !elements.roomMembersCount || !elements.roomUsersList) return;

    elements.roomNameText.textContent = this.store.room.name;
    elements.roomMembersCount.textContent = `${this.store.room.members.length} participant${
      this.store.room.members.length === 1 ? "" : "s"
    }`;

    elements.roomUsersList.innerHTML = this.store.room.members
      .map((member, index) => this.createUserListItem(member, index))
      .join("");
  }

  private createUserListItem(member: Member, index: number): string {
    const colorGradient = userColorGradients[index % userColorGradients.length];
    const isUserActive = member.socketId.length > 0;
    const isMuted = member.isMuted;
    const isJoinedInAudioChat = member.isJoinedInAudioChat;

    return `
      <div class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-gradient-to-r ${colorGradient} flex items-center justify-center text-white font-medium">
            ${member.userName[0]}
          </div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 ${
            isUserActive ? "bg-green-500" : "bg-gray-500"
          } border-2 border-gray-800 rounded-full"></div>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium">${member.userName}</p>
          <p class="text-xs text-gray-400">${member.isHost ? "Host" : ""}</p>
        </div>
        ${
          isUserActive && isJoinedInAudioChat
            ? `
        <div class="flex items-center space-x-2">
          ${
            isMuted
              ? `<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                  <line x1="17" y1="7" x2="7" y2="17" stroke="currentColor" stroke-width="2"></line>
                </svg>`
              : `<div class="audio-bars">
                  <div class="audio-bar" style="height: 8px"></div>
                  <div class="audio-bar" style="height: 12px"></div>
                  <div class="audio-bar" style="height: 6px"></div>
                  <div class="audio-bar" style="height: 10px"></div>
                </div>`
          }
        </div>`
            : ""
        }
      </div>
    `;
  }

  public updateChatMessages() {
    const chatMessagesElement = document.getElementById("chatMessages");
    if (!chatMessagesElement) return;

    if (!this.store.room.messages.length) {
      chatMessagesElement.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <p class="text-gray-500">No messages yet</p>
        </div>
      `;
      return;
    }

    chatMessagesElement.innerHTML = this.store.room.messages
      .map(message => this.createMessageElement(message))
      .join("");

    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
  }

  private createMessageElement(message: Message): string {
    const senderIndex = this.store.room.members.findIndex(member => member.id === message.senderId);
    const sender = this.store.room.members[senderIndex];
    const colorGradient = userColorGradients[senderIndex % userColorGradients.length];

    return `
      <div class="chat-message">
        <div class="flex items-start space-x-3">
          <div class="relative">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r ${colorGradient} flex items-center justify-center text-white font-medium">
              ${sender?.userName[0]}
            </div>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-blue-400">${sender?.userName}</span>
              <span class="text-xs text-gray-500">${this.formatMessageTimestamp(message.createdAt)}</span>
            </div>
            <p class="text-sm text-gray-300 mt-1">${message.content}</p>
          </div>
        </div>
      </div>
    `;
  }

  private formatMessageTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;

    if (diffDays === 0) {
      return `Today at ${timeStr}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${timeStr}`;
    } else {
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year} at ${timeStr}`;
    }
  }

  public updateMuteButton(isMuted: boolean) {
    const elements = this.getUIElements();
    const muteButton = elements.muteControlBtn;

    if (!muteButton) return;

    if (isMuted) {
      muteButton.innerHTML = `
        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
          <line x1="17" y1="7" x2="7" y2="17" stroke="currentColor" stroke-width="2"></line>
        </svg>`;
    } else {
      muteButton.innerHTML = `
        <div class="audio-bars">
          <div class="audio-bar" style="height: 8px"></div>
          <div class="audio-bar" style="height: 12px"></div>
          <div class="audio-bar" style="height: 6px"></div>
          <div class="audio-bar" style="height: 10px"></div>
        </div>`;
    }
  }

  public audioChatControlButton(isUserJoinedInAudioChat: boolean) {
    const elements = this.getUIElements();
    const audioChatControlButton = elements.joinAudioChatControlBtn;
    const audioChatHoverText = elements.joinAudioChatControlBtnHoverText;

    if (!audioChatControlButton || !audioChatHoverText) return;

    if (isUserJoinedInAudioChat) {
      audioChatHoverText.textContent = "Leave Audio Chat";
      audioChatControlButton.classList.add("bg-red-700", "hover:bg-red-600");
      audioChatControlButton.classList.remove("bg-green-700", "hover:bg-green-600");
    } else {
      audioChatHoverText.textContent = "Join Audio Chat";
      audioChatControlButton.classList.add("bg-green-700", "hover:bg-green-600");
      audioChatControlButton.classList.remove("bg-red-700", "hover:bg-red-600");
    }
  }

  public streamScreenControlButton(isHostStreaming: boolean) {
    const elements = this.getUIElements();
    const streamScreenControlButton = elements.streamScreenControlBtn;
    const streamScreenHoverText = elements.streamScreenControlBtnHoverText;

    if (!streamScreenControlButton || !streamScreenHoverText) return;

    if (isHostStreaming) {
      streamScreenHoverText.textContent = "Stop Screen Sharing";
      streamScreenControlButton.classList.add("bg-red-700", "hover:bg-red-600");
      streamScreenControlButton.classList.remove("bg-green-700", "hover:bg-green-600");
    } else {
      streamScreenHoverText.textContent = "Stream Screen";
      streamScreenControlButton.classList.add("bg-green-700", "hover:bg-green-600");
      streamScreenControlButton.classList.remove("bg-red-700", "hover:bg-red-600");
    }
  }

  private playNotificationSound(type: "success" | "info" | "error" | "warning") {
    // Clear any existing timeout
    if (this.notificationDebounceTimeout) {
      clearTimeout(this.notificationDebounceTimeout);
    }

    // Check if enough time has passed since last notification
    const now = Date.now();
    if (now - this.lastNotificationTime < this.DEBOUNCE_DELAY) {
      // If not enough time has passed, schedule the sound for later
      this.notificationDebounceTimeout = setTimeout(() => {
        this.playSound(type);
      }, this.DEBOUNCE_DELAY);
    } else {
      // If enough time has passed, play the sound immediately
      this.playSound(type);
    }
    
    this.lastNotificationTime = now;
  }

  private playSound(type: "success" | "info" | "error" | "warning") {
    const audio = new Audio(
      type === "success" || type === "info" 
        ? "/positive-alert.mp3" 
        : "/negative-alert.mp3"
    );
    audio.play().catch(err => console.warn("Could not play notification sound:", err));
  }

  public showNotification(message: string, type: "success" | "info" | "error" | "warning") {
    this.playNotificationSound(type);

    if (type === "success") {
      this.notyf.success({
        message,
        duration: 2000,
        dismissible: true,
        position: {
          x: "center",
          y: "top",
        },
      });
    } else if (type === "info") {
      this.notyf.success({
        message,
        duration: 2000,
        dismissible: true,
        position: {
          x: "center",
          y: "top",
        },
        type: "custom",
        className: "bg-blue-500 text-white",
      });
    } else if (type === "error") {
      this.notyf.error({
        message,
        duration: 3000,
        dismissible: true,
        position: { x: "center", y: "top" },
      });
    } else if (type === "warning") {
      this.notyf.success({
        message,
        duration: 3000,
        dismissible: true,
        position: { x: "center", y: "top" },
        type: "custom",
        className: "bg-orange-500 text-white",
      });
    }
  }

  public showError(message: string) {
    this.notyf.error({
      message,
      duration: 3000,
      dismissible: true,
      position: { x: "center", y: "top" },
    });
  }

  public showLoadingError(title: string, description: string) {
    const errorText = document.getElementById("error-text");
    const errorDescription = document.getElementById("error-description");
    const loadingText = document.getElementById("loading-text");

    if (errorText && errorDescription && loadingText) {
      loadingText.textContent = "";
      errorText.textContent = title;
      errorDescription.textContent = description;
    }
  }

  public updateLoadingText(text: string) {
    const loadingText = document.getElementById("loading-text");
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  public removeLoadingOverlay() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }

  public hideStreamingPlaceholder() {
    const elements = this.getUIElements();
    const streamingPlaceholder = elements.emptyVideoContainer;

    if (streamingPlaceholder) {
      streamingPlaceholder.classList.add("hidden");
    }
  }

  public showStreamingPlaceholder() {
    const elements = this.getUIElements();
    const streamingPlaceholder = elements.emptyVideoContainer;

    if (streamingPlaceholder) {
      streamingPlaceholder.classList.remove("hidden");
    }
  }

  public showVideoPlayer() {
    const elements = this.getUIElements();
    const videoPlayerContainer = elements.videoPlayerContainer;

    if (videoPlayerContainer) {
      videoPlayerContainer.classList.remove("hidden");
    }
  }

  public hideVideoPlayer() {
    const elements = this.getUIElements();
    const videoPlayerContainer = elements.videoPlayerContainer;

    if (videoPlayerContainer) {
      videoPlayerContainer.classList.add("hidden");
    }
  }

  public isVideoPlayerOpen() {
    const elements = this.getUIElements();
    const videoPlayerContainer = elements.videoPlayerContainer;
    const placeholder = elements.emptyVideoContainer;

    return !videoPlayerContainer.classList.contains("hidden") && placeholder.classList.contains("hidden");
  }

}
