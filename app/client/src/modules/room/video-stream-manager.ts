import { Socket } from "socket.io-client";
import { EVENTS } from "../../common/constants";
import Store from "./store";
import UIManager from "./uiManager";
import { Notyf } from "notyf";

export default class VideoStreamManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket: Socket;
  private store: Store;
  private uiManager: UIManager;

  constructor(socket: Socket, store: Store, uiManager: UIManager, _: Notyf) {
    this.socket = socket;
    this.store = store;
    this.uiManager = uiManager;
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    // Handle signaling events
    this.socket.on(EVENTS.RECEIVE_WEBRTC_OFFER_FOR_VIDEO_STREAM, async ({ from, offer }) => {
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
      this.socket.emit(EVENTS.SEND_WEBRTC_ANSWER_FOR_VIDEO_STREAM, {
        to: connection.id,
        answer,
        roomId: this.store.room.id,
      });
    });

    this.socket.on(EVENTS.RECEIVE_WEBRTC_ANSWER_FOR_VIDEO_STREAM, async ({ from, answer }) => {
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

    this.socket.on(EVENTS.RECEIVE_WEBRTC_ICE_CANDIDATE_FOR_VIDEO_STREAM, async ({ from, candidate }) => {
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

    this.socket.on(EVENTS.USER_STARTED_VIDEO_STREAM, ({ userId, stream }) => {
      console.log(`User ${userId} started video stream`, stream);

      const connection = this.store.room.members.find(member => member.id === userId);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      this.store.setStreams([...this.store.room.streams, stream]);

      this.uiManager.showVideoPlayer();
      this.uiManager.hideStreamingPlaceholder();
      this.uiManager.showNotification(`${connection.userName} started video stream`, "info");
    });

    this.socket.on(EVENTS.USER_STOPPED_VIDEO_STREAM, ({ userId }) => {
      console.log(`User ${userId} ended video stream`);

      const connection = this.store.room.members.find(member => member.id === userId);
      if (!connection) {
        console.error("Connection not found");
        return;
      }

      this.store.setStreams(
        this.store.room.streams.filter(stream => {
          if (stream.userId === userId && stream.type === "video-stream") {
            return false;
          }
          return true;
        })
      );

      const videoPlayer = this.uiManager.getUIElements().videoPlayer as HTMLVideoElement;
      if (videoPlayer) {
        videoPlayer.srcObject = null;
      }

      this.uiManager.showStreamingPlaceholder();
      this.uiManager.hideVideoPlayer();
      this.uiManager.showNotification(`${connection.userName} ended video stream`, "warning");
    });
  }

  async startVideoStream(): Promise<void> {
    try {
    } catch (error) {
      console.error("Error starting audio chat:", error);
      throw new Error(
        "Failed to start audio chat: " + (error instanceof Error ? error.message : "An unknown error occurred")
      );
    }
  }

  async startScreenSharing() {
    try {
      // Request screen sharing stream
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      this.uiManager.hideStreamingPlaceholder();
      this.uiManager.showVideoPlayer();
      this.handleRemoteStream(this.localStream);
      
      this.store.room.members.forEach(async member => {
        const isMe = member.id === this.store.user!.id;
        const isConnected = member.socketId.length > 0;
        if (isMe || !isConnected) return;

        const isConnectedToVideoStream = this.peerConnections.has(member.id);
        if (isConnectedToVideoStream) return;

        console.log("creating peer connection for streaming video", member.id);
        await this.createPeerConnectionAndSendOffer(member.id);
      });

      this.socket.emit(EVENTS.START_VIDEO_STREAM, { roomId: this.store.room.id, streamId: this.localStream.id });
      this.store.setStreams([
        ...this.store.room.streams,
        {
          id: this.localStream.id,
          type: "video-stream",
          userId: this.store.user!.id,
        },
      ]);
      this.store.setRoom({ isVideoStreamActive: true });
      this.uiManager.streamScreenControlButton(true);
      this.uiManager.showNotification("Screen sharing started", "success");

      // Handle stream stop
      const videoTrack = this.localStream?.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopStream();
        };
      }
    } catch (error) {
      console.error("Error starting screen share:", error);
      this.uiManager.showNotification(
        "Failed to start screen sharing: " + (error instanceof Error ? error.message : "An unknown error occurred"),
        "error"
      );
    }
  }

  public async createPeerConnectionAndSendOffer(userId: string): Promise<void> {
    const peerConnection = await this.createPeerConnection(userId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log(`Sending WebRTC offer to ${userId}`);
    this.socket.emit(EVENTS.SEND_WEBRTC_OFFER_FOR_VIDEO_STREAM, { to: userId, offer, roomId: this.store.room.id });
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
      console.log("ontrack event", event);
      const remoteStream = event.streams[0];

      const stream = this.store.room.streams.find(stream => stream.id === remoteStream.id);

      if (!stream) {
        console.error("Recieved unknown stream");
        this.uiManager.showNotification("Unknown stream received", "error");
        return;
      }

      if (stream.type === "video-stream") {
        console.log("video stream received");
        const isVideoPlayerOpen = this.uiManager.isVideoPlayerOpen();
        if (!isVideoPlayerOpen) {
          this.uiManager.showVideoPlayer();
          this.uiManager.hideStreamingPlaceholder();
        }
        this.handleRemoteStream(remoteStream);
      }
    };

    peerConnection.onicecandidate = event => {
      if (event?.candidate) {
        console.log(`Sending ICE candidate to ${userId}`);
        this.socket.emit(EVENTS.SEND_WEBRTC_ICE_CANDIDATE_FOR_VIDEO_STREAM, {
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
      this.socket.emit(EVENTS.SEND_WEBRTC_OFFER_FOR_VIDEO_STREAM, { to: userId, offer, roomId: this.store.room.id });
    };
  }

  private handleRemoteStream(stream: MediaStream): void {
    const videoPlayer = this.uiManager.getUIElements().videoPlayer as HTMLVideoElement;
    if (videoPlayer) {
      videoPlayer.srcObject = stream;
      videoPlayer.play();
    }
  }

  public stopStream() {
    this.socket.emit(EVENTS.STOP_VIDEO_STREAM, { roomId: this.store.room.id, streamId: this.localStream?.id });

    this.localStream?.getTracks().forEach(track => track.stop());
    this.localStream = null;

    // Close all peer connections
    this.peerConnections.forEach(connection => connection.close());
    this.peerConnections.clear();

    this.store.setStreams(
      this.store.room.streams.filter(stream => {
        if (stream.userId === this.store.user!.id && stream.type === "video-stream") {
          return false;
        }
        return true;
      })
    );
    this.store.setRoom({ isVideoStreamActive: false });

    const elements = this.uiManager.getUIElements();
    const videoPlayer = elements.videoPlayer as HTMLVideoElement;

    videoPlayer.srcObject = null;

    this.uiManager.showStreamingPlaceholder();
    this.uiManager.hideVideoPlayer();
    this.uiManager.showNotification("Screen sharing has ended", "info");
    this.uiManager.streamScreenControlButton(false);
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
