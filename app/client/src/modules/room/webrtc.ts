import { Socket } from "socket.io-client";
import { notyf } from "./index";
import store from "./store";
import { EVENTS } from "../../common/constants";
import { updateUsersInLeftSidebar } from "./ui";
export default class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket: Socket;
  private isMuted: boolean = false;

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    // Handle signaling events
    this.socket.on(EVENTS.RECEIVE_WEBRTC_OFFER, async ({ from, offer }) => {
      console.log(`Received WebRTC offer from ${from}`);

      const connection = store.room.members.find(member => member.socketId === from);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      const peerConnection = await this.createPeerConnection(connection.id);
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log(`Sending WebRTC answer to ${connection.id}`);
      this.socket.emit(EVENTS.SEND_WEBRTC_ANSWER, { to: connection.id, answer, roomId: store.room.id });
    });

    this.socket.on(EVENTS.RECEIVE_WEBRTC_ANSWER, async ({ from, answer }) => {
      console.log(`Received WebRTC answer from ${from}`);

      const connection = store.room.members.find(member => member.socketId === from);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      const peerConnection = this.peerConnections.get(connection.id);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    });

    this.socket.on(EVENTS.RECEIVE_WEBRTC_ICE_CANDIDATE, async ({ from, candidate }) => {
      console.log(`Received ICE candidate from ${from}`);

      const connection = store.room.members.find(member => member.socketId === from);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      const peerConnection = this.peerConnections.get(connection.id);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    });
  }

  async startAudioChat(): Promise<void> {
    try {
      // Get microphone permission and stream
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      store.room.members.forEach(member => {
        if (member.socketId && member.socketId !== this.socket.id) {
          this.createPeerConnectionAndSendOffer(member.id);
        }
      });
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
    this.socket.emit(EVENTS.SEND_WEBRTC_OFFER, { to: userId, offer, roomId: store.room.id });
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

    this.bindPeerConnectionListeners(peerConnection, userId)

    return peerConnection;
  }

  private bindPeerConnectionListeners(peerConnection: RTCPeerConnection, userId: string): void {
    // Handle incoming streams
    peerConnection.ontrack = event => {
      const remoteStream = event.streams[0];
      this.handleRemoteStream(userId, remoteStream);
    };

    peerConnection.onicecandidate = event => {
      if (event?.candidate) {
        console.log(`Sending ICE candidate to ${userId}`);
        this.socket.emit(EVENTS.SEND_WEBRTC_ICE_CANDIDATE, {
          to: userId,
          candidate: event.candidate,
          roomId: store.room.id,
        });
      }
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
  }

  toggleMute(): boolean {
    if (!this.localStream) {
      console.warn("No local stream available");
      return false;
    }

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn("No audio tracks found");
      return false;
    }

    this.isMuted = !this.isMuted;
    audioTracks.forEach(track => {
      track.enabled = !this.isMuted;
    });

    // Update local store first
    store.room.members = store.room.members.map(member => {
      if (member.id === store.user!.id) {
        return {
          ...member,
          isMuted: this.isMuted
        };
      }
      return member;
    });

    // Update UI
    updateUsersInLeftSidebar();

    // Emit audio status change
    this.socket.emit(EVENTS.AUDIO_STATUS_CHANGED, {
      roomId: store.room.id,
      userId: store.user!.id,
      isMuted: this.isMuted
    });

    return this.isMuted;
  }

  isMicrophoneMuted(): boolean {
    return this.isMuted;
  }
}
