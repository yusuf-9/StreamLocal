import { Socket } from "socket.io-client";
import { EVENTS } from "../../common/constants";
import Store from "./store";
import UIManager from "./uiManager";
import { Notyf } from "notyf";

export default class AudioChatManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket: Socket;
  private store: Store;
  private uiManager: UIManager;
  private isMuted: boolean = false;

  constructor(socket: Socket, store: Store, uiManager: UIManager, _: Notyf) {
    this.socket = socket;
    this.store = store;
    this.uiManager = uiManager;
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    // Handle signaling events
    this.socket.on(EVENTS.RECEIVE_WEBRTC_OFFER_FOR_AUDIO_CHAT, async ({ from, offer }) => {
      console.log(`Received WebRTC offer from ${from}`);

      const connection = this.store.room.members.find(member => member.socketId === from);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      const peerConnection = await this.createPeerConnection(connection.id);
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log(`Sending WebRTC answer to ${connection.id}`);
      this.socket.emit(EVENTS.SEND_WEBRTC_ANSWER_FOR_AUDIO_CHAT, {
        to: connection.id,
        answer,
        roomId: this.store.room.id,
      });
    });

    this.socket.on(EVENTS.RECEIVE_WEBRTC_ANSWER_FOR_AUDIO_CHAT, async ({ from, answer }) => {
      console.log(`Received WebRTC answer from ${from}`);

      const connection = this.store.room.members.find(member => member.socketId === from);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      const peerConnection = this.peerConnections.get(connection.id);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    });

    this.socket.on(EVENTS.RECEIVE_WEBRTC_ICE_CANDIDATE_FOR_AUDIO_CHAT, async ({ from, candidate }) => {
      console.log(`Received ICE candidate from ${from}`);

      const connection = this.store.room.members.find(member => member.socketId === from);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      const peerConnection = this.peerConnections.get(connection.id);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    });

    this.socket.on(EVENTS.USER_JOINED_AUDIO_CHAT, ({ userId, stream }) => {
      console.log(`User ${userId} joined audio chat`, stream);

      const connection = this.store.room.members.find(member => member.id === userId);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      this.store.room.members.forEach(member => {
        if (member.id === userId) {
          member.isJoinedInAudioChat = true;
        }
      });

      this.uiManager.showNotification(connection.userName + " joined audio chat", "info");
      this.uiManager.updateUsersList();
      this.store.setStreams([...this.store.room.streams, stream]);
      console.log({ streams: this.store.room.streams });
    });

    this.socket.on(EVENTS.USER_LEFT_AUDIO_CHAT, ({ userId }) => {
      console.log(`User ${userId} left audio chat`);

      const connection = this.store.room.members.find(member => member.id === userId);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      this.store.room.members.forEach(member => {
        if (member.id === userId) {
          member.isJoinedInAudioChat = false;
        }
      });

      this.uiManager.showNotification(`User ${connection.userName} left audio chat`, "warning");
      this.uiManager.updateUsersList();
      this.store.setStreams(
        this.store.room.streams.filter(stream => {
          if (stream.userId === userId && stream.type === "audio-chat") {
            return false;
          }
          return true;
        })
      );
      console.log({ streams: this.store.room.streams });
    });
  }

  async startAudioChat(): Promise<void> {
    try {
      // Get microphone permission and stream
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.store.room.members.forEach(member => {
        const isConnectedToAudioChat = member.isJoinedInAudioChat;
        const isConnected = member.socketId.length > 0;
        if (member.id !== this.store.user!.id && isConnectedToAudioChat && isConnected) {
          this.createPeerConnectionAndSendOffer(member.id);
        }
      });

      this.store.room.members.forEach(member => {
        if (member.id === this.store.user!.id) {
          member.isJoinedInAudioChat = true;
        }
      });

      this.uiManager.updateUsersList();
      this.uiManager.audioChatControlButton(true);

      this.uiManager.showNotification("Connected to audio chat", "success");

      this.socket.emit(EVENTS.JOIN_AUDIO_CHAT, { roomId: this.store.room.id, streamId: this.localStream.id });
      this.store.setStreams([
        ...this.store.room.streams,
        {
          id: this.localStream.id,
          type: "audio-chat",
          userId: this.store.user!.id,
        },
      ]);
    } catch (error) {
      console.error("Error starting audio chat:", error);
      throw new Error(
        "Failed to start audio chat: " + (error instanceof Error ? error.message : "An unknown error occurred")
      );
    }
  }

  private async createPeerConnectionAndSendOffer(userId: string): Promise<void> {
    const peerConnection = await this.createPeerConnection(userId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log(`Sending WebRTC offer to ${userId}`);
    this.socket.emit(EVENTS.SEND_WEBRTC_OFFER_FOR_AUDIO_CHAT, { to: userId, offer, roomId: this.store.room.id });
  }

  private async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const peerConnection = new RTCPeerConnection(configuration);
    this.peerConnections.set(userId, peerConnection);

    // Add local stream tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    this.bindPeerConnectionListeners(peerConnection, userId);

    return peerConnection;
  }

  private bindPeerConnectionListeners(peerConnection: RTCPeerConnection, userId: string): void {
    // Handle incoming streams
    peerConnection.ontrack = event => {
      const remoteStream = event.streams[0];
      console.log("ontrack event", event);

      const stream = this.store.room.streams.find(stream => stream.id === remoteStream.id);

      if (!stream) {
        console.error("Recieved unknown stream");
        this.uiManager.showNotification("Unknown stream received", "error");
        return;
      }

      if (stream.type === "audio-chat") {
        this.handleRemoteStream(userId, remoteStream);
      }
    };

    peerConnection.onicecandidate = event => {
      if (event?.candidate) {
        console.log(`Sending ICE candidate to ${userId}`);
        this.socket.emit(EVENTS.SEND_WEBRTC_ICE_CANDIDATE_FOR_AUDIO_CHAT, {
          to: userId,
          candidate: event.candidate,
          roomId: this.store.room.id,
        });
      }
    };

    peerConnection.onnegotiationneeded = async () => {
      console.log("negotiationneeded event");
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.socket.emit(EVENTS.SEND_WEBRTC_OFFER_FOR_AUDIO_CHAT, { to: userId, offer, roomId: this.store.room.id });
    };
  }

  private handleRemoteStream(userId: string, stream: MediaStream): void {
    // Create and play audio element for the remote stream
    const audioElement = new Audio();
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    console.log("received remote stream from", userId, stream);
  }

  stopAudioChat(): void {
    // Stop local stream
    this.localStream?.getTracks().forEach(track => track.stop());
    this.localStream = null;

    // Close all peer connections
    this.peerConnections.forEach(connection => connection.close());
    this.peerConnections.clear();

    this.store.room.members.forEach(member => {
      if (member.id === this.store.user!.id) {
        member.isJoinedInAudioChat = false;
      }
    });

    this.uiManager.updateUsersList();
    this.uiManager.audioChatControlButton(false);
    this.uiManager.showNotification("Disconnected from audio chat", "warning");

    this.socket.emit(EVENTS.LEAVE_AUDIO_CHAT, { roomId: this.store.room.id });
    this.store.setStreams(
      this.store.room.streams.filter(stream => {
        if (stream.userId === this.store.user!.id && stream.type === "audio-chat") {
          return false;
        }
        return true;
      })
    );
  }

  toggleMute(): boolean {
    if (!this.localStream) {
      this.uiManager.showNotification("You are not connected to any audio channel", "warning");
      return false;
    }

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      this.uiManager.showNotification("No audio tracks found", "warning");
      return false;
    }

    this.isMuted = !this.isMuted;
    audioTracks.forEach(track => {
      track.enabled = !this.isMuted;
    });

    // Update local store first
    this.store.room.members = this.store.room.members.map(member => {
      if (member.id === this.store.user!.id) {
        return {
          ...member,
          isMuted: this.isMuted,
        };
      }
      return member;
    });

    // Update UI
    this.uiManager.updateUsersList();

    // Emit audio status change
    this.socket.emit(EVENTS.AUDIO_STATUS_CHANGED, {
      roomId: this.store.room.id,
      userId: this.store.user!.id,
      isMuted: this.isMuted,
    });

    this.uiManager.showNotification(this.isMuted ? "You are now muted" : "You are now unmuted", "info");

    return this.isMuted;
  }

  public closeRTCConnection(connectionId: string) {
    const connection = this.peerConnections.get(connectionId);
    if (connection) {
      console.log("closing RTC connection", connectionId);
      connection.close();
      this.peerConnections.delete(connectionId);
    }
  }
}
