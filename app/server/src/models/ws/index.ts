import { Server as HTTPServer } from "http";
import { DefaultEventsMap, Server as SocketServer, Socket } from "socket.io";
import { Express } from "express";
import http from "http";
import Store from "../store";
import { EVENTS } from "../../constants";
import { Connection, Message } from "../store/types";

export default class SocketModel {
  private io: SocketServer;
  private store: Store;
  private httpServer: HTTPServer;

  constructor(app: Express, store: Store) {
    this.httpServer = http.createServer(app);
    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.store = store;
    this.setupEventListeners();
  }

  public start(port: number): void {
    this.httpServer.listen(port, () => {
      console.log(`Socket server running on port ${port}`);
    });
  }

  private setupEventListeners(): void {
    this.io.on("connection", socket => {
      console.log("Client connected");

      this.store.addSocketConnection(socket.id);

      socket.on(
        EVENTS.JOIN_ROOM,
        this.createErrorBoundary(
          socket,
          (payload: { roomId: string; userId: string }, callback: (data: Connection) => void) => {
            const room = this.store.getRoom(payload.roomId);
            if (!room) {
              throw new Error("Room not found");
            }

            socket.join(payload.roomId);
            const socketConnection = this.store.updateUserSocketId(payload.roomId, payload.userId, socket.id);

            // Send current mute states to the joining user
            const mutedUsers = Array.from(room.connections.values())
              .filter(conn => conn.isMuted)
              .map(conn => ({
                userId: conn.id,
                isMuted: conn.isMuted
              }));

            socket.emit(EVENTS.USER_AUDIO_STATUS_CHANGED, mutedUsers);
            
            callback(socketConnection);
            socket.broadcast.to(payload.roomId).emit(EVENTS.USER_JOINED, socketConnection);
          }
        )
      );

      socket.on(
        EVENTS.SEND_MESSAGE,
        this.createErrorBoundary(
          socket,
          (payload: { roomId: string; userId: string; content: string }, callback: (message: Message) => void) => {
            const room = this.store.getRoom(payload.roomId);
            if (!room) {
              throw new Error("Room not found");
            }

            if (!payload.content) {
              throw new Error("Message content is required");
            }

            const message = this.store.addMessage(payload.roomId, payload.userId, payload.content);
            callback(message);
            socket.broadcast.to(payload.roomId).emit(EVENTS.RECEIVE_MESSAGE, message);
          }
        )
      );

      // Add WebRTC signaling handlers
      socket.on(
        EVENTS.SEND_WEBRTC_OFFER,
        this.createErrorBoundary(socket, ({ to, offer, roomId }: { to: string; offer: any; roomId: string }) => {
          const room = this.store.getRoom(roomId);
          if (!room) {
            throw new Error("Room not found");
          }

          const connection = room.connections.get(to);
          if (!connection || connection.socketId === "") {
            throw new Error("Connection not found");
          }

          socket.to(connection.socketId).emit(EVENTS.RECEIVE_WEBRTC_OFFER, { from: socket.id, offer });
        })
      );

      socket.on(
        EVENTS.SEND_WEBRTC_ANSWER,
        this.createErrorBoundary(socket, ({ to, answer, roomId }: { to: string; answer: any; roomId: string }) => {
          const room = this.store.getRoom(roomId);
          if (!room) {
            throw new Error("Room not found");
          }

          const connection = room.connections.get(to);
          if (!connection || connection.socketId === "") {
            throw new Error("Connection not found");
          }

          socket.to(connection.socketId).emit(EVENTS.RECEIVE_WEBRTC_ANSWER, { from: socket.id, answer });
        })
      );

      socket.on(
        EVENTS.SEND_WEBRTC_ICE_CANDIDATE,
        this.createErrorBoundary(
          socket,
          ({ to, candidate, roomId }: { to: string; candidate: any; roomId: string }) => {
            const room = this.store.getRoom(roomId);
            if (!room) {
              throw new Error("Room not found");
            }

            const connection = room.connections.get(to);
            if (!connection || connection.socketId === "") {
              throw new Error("Connection not found");
            }

            socket.to(connection.socketId).emit(EVENTS.RECEIVE_WEBRTC_ICE_CANDIDATE, { from: socket.id, candidate });
          }
        )
      );

      socket.on(EVENTS.AUDIO_STATUS_CHANGED, ({ roomId, userId, isMuted }) => {
        const room = this.store.getRoom(roomId);
        if (!room) {
          socket.emit(EVENTS.ERROR, "Room not found");
          return;
        }

        // Update the mute status in the store
        const connection = room.connections.get(userId);
        if (connection) {
          connection.isMuted = isMuted;
        }

        // Broadcast to all users in the room except sender
        socket.broadcast.to(roomId).emit(EVENTS.USER_AUDIO_STATUS_CHANGED, {
          userId,
          isMuted
        });
      });

      socket.on(EVENTS.JOIN_AUDIO_CHAT, ({ roomId }) => {
        const room = this.store.getRoom(roomId);
        if (!room) {
          socket.emit(EVENTS.ERROR, "Room not found");
          return;
        }

        // Update the mute status in the store
        const sender = Array.from(room.connections.values()).find(conn => conn.socketId === socket.id);
        if (!sender) {
          throw new Error("You are not in this room");
        }

        sender.isJoinedInAudioChat = true;

        // Broadcast to all users in the room except sender
        socket.broadcast.to(roomId).emit(EVENTS.USER_JOINED_AUDIO_CHAT, {
          userId: sender.id,
        });
      });

      socket.on(EVENTS.LEAVE_AUDIO_CHAT, ({ roomId }) => {
        const room = this.store.getRoom(roomId);
        if (!room) {
          socket.emit(EVENTS.ERROR, "Room not found");
          return;
        }

        const sender = Array.from(room.connections.values()).find(conn => conn.socketId === socket.id);
        if (!sender) {
          throw new Error("You are not in this room");
        }

        sender.isJoinedInAudioChat = false;

        // Broadcast to all users in the room except sender
        socket.broadcast.to(roomId).emit(EVENTS.USER_LEFT_AUDIO_CHAT, {
          userId: sender.id,
        });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
        this.store.removeSocketConnection(socket.id);

        // Find room that has this socket connection
        for (const room of this.store.getRooms()) {
          for (const [userId, connection] of room.connections) {
            if (connection.socketId === socket.id) {
              // Remove user from room connections
              connection.socketId = "";

              // Notify room members that user left
              socket.broadcast.to(room.id).emit(EVENTS.USER_LEFT, userId);
              return;
            }
          }
        }
      });
    });
  }

  private createErrorBoundary(
    socketInstance: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    handler: Function
  ) {
    return (...args: any[]) => {
      try {
        handler.apply(this, args);
      } catch (error) {
        socketInstance.emit(EVENTS.ERROR, error instanceof Error ? error.message : "An error occurred");

        console.error(error);
      }
    };
  }

  public getSocketServer(): SocketServer {
    return this.io;
  }
}
