import { QUERY_PARAM_KEYS } from "../../common/constants/index";
import { retryPromiseIfFails } from "../../common/utils/index";
import store from "./store";

import { io as socketIO, Socket } from "socket.io-client";

import { initializeRoomUI } from "./ui";

document.addEventListener("DOMContentLoaded", async () => {
  const errorText = document.getElementById("error-text")!;
  const errorDescription = document.getElementById("error-description")!;
  const loadingText = document.getElementById("loading-text")!;

  try {
    loadingText.textContent = "Fetching room state...";
    await loadRoom();
    loadingText.textContent = "Connecting to room...";
    await connectToRoom();
    // initializeRoomUI();
  } catch (error) {
    console.error(error);
    loadingText.textContent = "";
    errorText.textContent = "Failed to load room. Please try again.";
    errorDescription.textContent = error instanceof Error ? error.message : "An unknown error occurred";
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
    store.roomId = roomId;
    store.roomName = roomData.name;
    store.messages = roomData.messages;
    store.members = roomData.users;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function connectToRoom() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get(QUERY_PARAM_KEYS.ROOM_ID);
  const userId = params.get(QUERY_PARAM_KEYS.USER_ID);

  if (!roomId || !userId) {
    throw new Error("roomId or userId is missing in the URL");
  }

  const socketInstance = socketIO("http://localhost:3000/");

  socketInstance.on("connect", () => {
    console.log("Connected to room websocket");
  });
  socketInstance.on("disconnect", () => {
    console.log("Disconnected from room websocket");
  });

  return socketInstance;
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
