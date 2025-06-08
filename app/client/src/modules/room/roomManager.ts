import { EVENTS, QUERY_PARAM_KEYS } from "../../common/constants";
import { retryPromiseIfFails } from "../../common/utils";
import { Socket, io as socketIO } from "socket.io-client";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import WebRTCManager from "./webRtc";
import UIManager from "./uiManager";
import Store from "./store";
import type { Message, Member, Stream } from "./types";
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

      await this.webRTCManager.joinRTCConnectionPool()
      // await this.webRTCManager.startAudioChat();
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
      streams: roomData.streams,
    });

    CacheManager.setCachedRoomId(roomId);
    CacheManager.setCachedUserId(userId);
  }

  private async fetchRoomData(roomId: string): Promise<{
    name: string;
    messages: Message[];
    users: Member[];
    streams: Stream[];
  }> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/room/${roomId}`);
    if (!response.ok) {
      let errorMessage = "Something went wrong";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, use the status text or default message
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
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
      this.store.setStreams(this.store.room.streams.filter(stream => stream.userId !== userId));
      this.uiManager.updateUsersList();
      this.uiManager.showNotification(`${user.userName} left`, "warning");
      this.webRTCManager?.closeRTCConnection(userId)
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

    elements.shareControlBtn.addEventListener("click", () => this.handleShareInviteLink());
    elements.endCallControlBtn.addEventListener("click", () => this.handleLeaveRoom());
    elements.joinAudioChatControlBtn.addEventListener("click", () => {
      const isJoinedInAudioChat = this.store.room.members.find(
        member => member.id === this.store.user?.id
      )?.isJoinedInAudioChat;
      if (isJoinedInAudioChat) {
        this.webRTCManager?.stopAudioChat();
        return;
      }

      this.webRTCManager?.startAudioChat();
    });

    elements.streamScreenControlBtn.addEventListener("click", () => {
      if (!this.checkIsHost()) {
        this.uiManager.showNotification("You are not the host of this room. Only host can stream screen", "error");
        return;
      }

      this.webRTCManager?.startScreenSharing();
    });

    elements.streamVideoFileControlBtn.addEventListener("click", () => {
      if (!this.checkIsHost()) {
        this.uiManager.showNotification("You are not the host of this room. Only host can stream video file", "error");
        return;
      }

      this.webRTCManager?.startVideoFileSharing();
    });
  }

  private checkIsHost() {
    const host = this.store.room.members.find(member => member.isHost);
    return host?.id === this.store.user?.id;
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
    if (!confirm("Are you sure you want to leave the room?")) {
      return;
    }
    window.location.href = "/";
  }

  private bindWebRTCControls() {
    const muteButton = document.getElementById("muteControlBtn") as HTMLButtonElement;
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
