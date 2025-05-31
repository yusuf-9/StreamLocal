import { EVENTS, QUERY_PARAM_KEYS } from "../../common/constants";
import { retryPromiseIfFails } from "../../common/utils";
import { Socket, io as socketIO } from "socket.io-client";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import WebRTCManager from "./webRtc";
import UIManager from "./uiManager";
import Store from "./store";
import type { Message, Member } from "./types";
import CacheManager from "../../common/services/cacheManager";
export default class RoomManager {
  private socket: Socket | null = null;
  private webRTCManager: WebRTCManager | null = null;
  private uiManager: UIManager;
  private store: Store;
  public notyf: Notyf;

  constructor() {
    this.notyf = new Notyf();
    this.store = new Store();
    this.uiManager = new UIManager(this.store, this.notyf);
  }

  public async initialize() {
    try {
      this.uiManager.updateLoadingText("Loading room...");
      await this.loadRoom();
      this.uiManager.updateLoadingText("Connecting to room...");
      this.socket = await this.connectToRoom();

      this.uiManager.initialize();

      this.store.setRoomLoaded(true);

      this.webRTCManager = new WebRTCManager(this.socket, this.store, this.uiManager, this.notyf);

      this.bindSocketListeners();
      this.bindUIHandlers();

      await this.webRTCManager.startAudioChat();
      this.bindWebRTCControls();
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  private async loadRoom() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get(QUERY_PARAM_KEYS.ROOM_ID);
    const userId = params.get(QUERY_PARAM_KEYS.USER_ID);

    if (!roomId || !userId) {
      throw new Error("roomId or userId is missing in the URL");
    }

    const roomData = await retryPromiseIfFails(async () => this.fetchRoomData(roomId));
    this.store.setRoom({
      ...this.store.room,
      name: roomData.name,
      id: roomId,
      members: roomData.users,
      messages: roomData.messages,
    });

    CacheManager.setCachedRoomId(roomId);
    CacheManager.setCachedUserId(userId);
  }

  private async fetchRoomData(roomId: string): Promise<{
    name: string;
    messages: any[];
    users: any[];
  }> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/room/${roomId}`);
    return await response.json();
  }

  private async connectToRoom(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams(window.location.search);
      const roomId = params.get(QUERY_PARAM_KEYS.ROOM_ID);
      const userId = params.get(QUERY_PARAM_KEYS.USER_ID);

      if (!roomId || !userId) {
        reject(new Error("roomId or userId is missing in the URL"));
        return;
      }

      const socketInstance = socketIO(import.meta.env.VITE_WS_URL);

      socketInstance.on("connect", () => {
        socketInstance.emit(EVENTS.JOIN_ROOM, { roomId, userId }, (data: Member) => {
          this.store.setUser(data);
          this.store.setRoomMembers([...this.store.room.members, data]);
          resolve(socketInstance);
        });
      });
    });
  }

  private bindSocketListeners() {
    if (!this.socket) return;

    this.socket.on(EVENTS.ERROR, (error: string | undefined) => {
      this.uiManager.showNotification(error ?? "Failed to perform last action", "error");
    });

    this.socket.on(EVENTS.USER_JOINED, (data: Member) => {
      this.store.addRoomMember(data);
      this.uiManager.updateUsersList();
      this.uiManager.showNotification(`${data.userName} joined`, "info");
    });

    this.socket.on(EVENTS.USER_LEFT, (userId: string) => {
      const user = this.store.getMember(userId);
      if (!user) return;

      this.store.updateRoomMember(userId, { socketId: "" });
      this.uiManager.updateUsersList();
      this.uiManager.showNotification(`${user.userName} left`, "warning");
    });

    this.socket.on(EVENTS.RECEIVE_MESSAGE, (message: Message) => {
      this.store.addMessage(message);
      this.uiManager.updateChatMessages();
    });

    this.socket.on(EVENTS.USER_AUDIO_STATUS_CHANGED, ({ userId, isMuted }) => {
      this.store.updateRoomMember(userId, { isMuted });
      this.uiManager.updateUsersList();
    });
  }

  private bindUIHandlers() {
    const elements = this.uiManager.getUIElements();

    elements.chatForm.addEventListener("submit", e => {
      e.preventDefault();
      const message = (elements.chatInput as HTMLInputElement).value;
      if (!message || !this.socket) return;

      this.socket.emit(
        EVENTS.SEND_MESSAGE,
        {
          roomId: this.store.room.id,
          userId: this.store.user?.id,
          content: message,
        },
        (message: Message) => {
          this.store.addMessage(message);
          this.uiManager.updateChatMessages();
        }
      );
      (elements.chatInput as HTMLInputElement).value = "";
    });

    elements.shareBtn.addEventListener("click", () => this.handleShareInviteLink());
    elements.endCallBtn.addEventListener("click", () => this.handleLeaveRoom());
    elements.joinAudioChat.addEventListener("click", () => {
      const isJoinedInAudioChat = this.store.room.members.find(member => member.id === this.store.user?.id)?.isJoinedInAudioChat;
      if (isJoinedInAudioChat) {
        this.webRTCManager?.stopAudioChat();
        return;
      }

      this.webRTCManager?.startAudioChat();
    });
  }

  private handleShareInviteLink() {
    const url = new URL(window.location.href);
    const roomId = url.searchParams.get("id");
    const baseUrl = url.origin.replace("/room.html", "");
    const inviteLink = `${baseUrl}?id=${roomId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        this.uiManager.showNotification("Invite link copied to clipboard!", "success");
      })
      .catch(err => {
        console.error("Failed to copy link:", err);
        this.uiManager.showNotification("Failed to copy link to clipboard", "error");
      });
  }

  private handleLeaveRoom() {
    window.location.href = "/";
  }

  private bindWebRTCControls() {
    const muteButton = document.getElementById("muteBtn") as HTMLButtonElement;
    if (!muteButton || !this.webRTCManager) return;

    muteButton.addEventListener("click", () => {
      const isMuted = this.webRTCManager?.toggleMute();
      this.uiManager.updateMuteButton(isMuted ?? false);
    });
  }

  private handleInitializationError(error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";

    if (!this.store.isRoomLoaded) {
      this.uiManager.showLoadingError("Failed to load room. Please try again.", message);
    } else {
      this.uiManager.showNotification(message, "error");
    }
  }
}
