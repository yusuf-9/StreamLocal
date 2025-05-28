import { EVENTS, QUERY_PARAM_KEYS } from "../../common/constants/index";
import { retryPromiseIfFails } from "../../common/utils/index";
import store from "./store";
import type { Member, Message } from "./types";
import { io as socketIO, Socket } from "socket.io-client";
import { initializeRoomUI, updateChatMessagesUI, updateUsersInLeftSidebar } from "./ui";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import WebRTCManager from "./webrtc";

export const notyf = new Notyf();

let webRTCManager: WebRTCManager;

document.addEventListener("DOMContentLoaded", async () => {
  const errorText = document.getElementById("error-text")!;
  const errorDescription = document.getElementById("error-description")!;
  const loadingText = document.getElementById("loading-text")!;

  const loadingOverlay = document.getElementById("loading-overlay")!;

  try {
    // Load room state and connect to room
    loadingText.textContent = "Fetching room state...";
    await loadRoom();
    loadingText.textContent = "Connecting to room...";
    const socketInstance = await connectToRoom();
    initializeRoomUI();
    bindHandlers(socketInstance);
    loadingOverlay.remove();

    store.isRoomLoaded = true;

    // Initialize WebRTC manager
    webRTCManager = new WebRTCManager(socketInstance);
    await webRTCManager.startAudioChat();
    bindWebRTCControls();
  } catch (error) {
    console.error(error);

    if (store.isRoomLoaded) {
      loadingText.textContent = "";
      errorText.textContent = "Failed to load room. Please try again.";
      errorDescription.textContent = error instanceof Error ? error.message : "An unknown error occurred";
      return;
    }

    notyf.error({
      message: error instanceof Error ? error.message : "An unknown error occurred",
      duration: 3000,
      dismissible: true,
      position: {
        x: "center",
        y: "top",
      },
      type: "error",
    });
  }
});

async function loadRoom() {
  try {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get(QUERY_PARAM_KEYS.ROOM_ID);
    const userId = params.get(QUERY_PARAM_KEYS.USER_ID);

    if (!roomId || !userId) {
      throw new Error("roomId or userId is missing in the URL");
    }

    const roomData = await retryPromiseIfFails(async () => await fetchRoomData(roomId));
    store.room = {
      ...store.room,
      name: roomData.name,
      id: roomId,
      members: roomData.users,
      messages: roomData.messages,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function connectToRoom(): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get(QUERY_PARAM_KEYS.ROOM_ID);
    const userId = params.get(QUERY_PARAM_KEYS.USER_ID);

    if (!roomId || !userId) {
      reject(new Error("roomId or userId is missing in the URL"));
    }

    const socketInstance = socketIO(import.meta.env.VITE_WS_URL);

    socketInstance.on("connect", () => {
      registerSocketEventListeners(socketInstance);
      socketInstance.emit(
        EVENTS.JOIN_ROOM,
        {
          roomId,
          userId,
        },
        (data: Member) => {
          store.user = data;
          setUsersInStore([...store.room.members, data]);
          resolve(socketInstance);
        }
      );
      console.log("joined room", { store });
    });
  });
}

const setUsersInStore = (data: Member[]) => {
  store.room.members = [...new Map(data.map(item => [item.id, item])).values()].sort((a, b) => a.joinedAt - b.joinedAt);
};

function registerSocketEventListeners(socketInstance: Socket) {
  socketInstance.on(EVENTS.ERROR, (error: string | undefined) => {
    if (store.isRoomLoaded) {
      console.error(error);
      notyf.error({
        message: error ?? "Failed to perform last action.",
        duration: 3000,
        dismissible: true,
        position: {
          x: "center",
          y: "top",
        },
        type: "error",
      });
      return;
    }

    const errorText = document.getElementById("error-text")!;
    const errorDescription = document.getElementById("error-description")!;
    const loadingText = document.getElementById("loading-text")!;

    errorText.innerText = "Failed to load room";
    errorDescription.innerText = error ?? "Something went wrong";
    loadingText.innerText = "";
  });
  socketInstance.on(EVENTS.USER_JOINED, (data: Member) => {
    setUsersInStore([...store.room.members, data]);
    updateUsersInLeftSidebar();
    notyf.success({
      message: `${data.userName} joined`,
      duration: 2000,
      dismissible: true,
      position: {
        x: "center",
        y: "top",
      },
      type: "custom",
      className: "bg-blue-500 text-white",
    });
  });
  socketInstance.on(EVENTS.USER_LEFT, (userId: string) => {
    const user = store.room.members.find(member => member.id === userId);
    if (!user) {
      return;
    }
    setUsersInStore(store.room.members.map(member => {
      if (member.id === userId) {
        return {
          ...member,
          socketId: "",
        };
      }
      return member;
    }));
    updateUsersInLeftSidebar();
    notyf.success({
      message: `${user?.userName} left`,
      duration: 2000,
      dismissible: true,
      position: {
        x: "center",
        y: "top",
      },
      type: "custom",
      className: "bg-orange-500 text-white",
    });
  });
  socketInstance.on(EVENTS.RECEIVE_MESSAGE, (message: Message) => {
    store.room.messages.push(message);
    updateChatMessagesUI();
  });
  socketInstance.on(EVENTS.USER_AUDIO_STATUS_CHANGED, ({ userId, isMuted }) => {
    // Update the user's mute status in store
    store.room.members = store.room.members.map(member => {
      if (member.id === userId) {
        return {
          ...member,
          isMuted
        };
      }
      return member;
    });
    
    // Update the UI
    updateUsersInLeftSidebar();
  });
}

async function fetchRoomData(roomId: string): Promise<{
  name: string;
  messages: any[];
  users: any[];
}> {
  return new Promise(async resolve => {
    const response = await fetch(import.meta.env.VITE_API_URL + "/room/" + roomId);
    const data: {
      name: string;
      messages: any[];
      users: any[];
    } = await response.json();
    resolve(data);
  });
}

async function bindHandlers(socketInstance: Socket) {
  const chatForm = document.getElementById("chatForm")!;
  const chatInput = document.getElementById("chatInput")!;

  chatForm.addEventListener("submit", e => {
    e.preventDefault();
    const message = (chatInput as HTMLInputElement).value;
    socketInstance.emit(
      EVENTS.SEND_MESSAGE,
      {
        roomId: store.room.id,
        userId: store.user!.id,
        content: message,
      },
      (message: Message) => {
        console.log("message acknowledged", message, { store });
        store.room.messages.push(message);
        updateChatMessagesUI();
      }
    );
    (chatInput as HTMLInputElement).value = "";
  });
}

function bindWebRTCControls() {
  const muteButton = document.getElementById("muteBtn") as HTMLButtonElement;
  const muteIcon = muteButton.querySelector("svg");

  // Add muted icon SVG path with diagonal line
  const mutedIconPath = `
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      class="opacity-50"
    />
    <line 
      x1="3" 
      y1="3" 
      x2="21" 
      y2="21" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round"
      class="text-red-500"
    />
  `;

  // Add unmuted icon SVG path
  const unmutedIconPath = `
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  `;

  muteButton.addEventListener("click", () => {
    const isMuted = webRTCManager.toggleMute();
    
    // Update button appearance with smooth transition
    if (isMuted) {
      muteButton.classList.add("bg-red-600/80", "hover:bg-red-500/80", "ring-2", "ring-red-500/50");
      muteButton.classList.remove("bg-gray-700/50", "hover:bg-gray-600/50");
      if (muteIcon) {
        muteIcon.innerHTML = mutedIconPath;
        muteIcon.classList.add("text-red-100");
        muteIcon.classList.remove("text-white");
      }
      // Add pulsing effect when muted
      muteButton.classList.add("animate-pulse");
    } else {
      muteButton.classList.remove(
        "bg-red-600/80", 
        "hover:bg-red-500/80", 
        "ring-2", 
        "ring-red-500/50", 
        "animate-pulse"
      );
      muteButton.classList.add("bg-gray-700/50", "hover:bg-gray-600/50");
      if (muteIcon) {
        muteIcon.innerHTML = unmutedIconPath;
        muteIcon.classList.remove("text-red-100");
        muteIcon.classList.add("text-white");
      }
    }

    // Show notification with updated styling
    notyf.success({
      message: isMuted ? "Microphone muted" : "Microphone unmuted",
      duration: 1500,
      dismissible: true,
      position: { x: "center", y: "top" },
      className: isMuted ? "bg-red-500" : "bg-green-500",
    });
  });

  // Add hover effect
  muteButton.classList.add("transition-all", "duration-200", "ease-in-out");
}
