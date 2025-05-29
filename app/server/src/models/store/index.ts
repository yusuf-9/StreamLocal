import { Room, Store as StoreType, Connection, Message } from "./types";
import CustomError from "../error";
import { generateUUID } from "../../utils";

export default class Store {
  private data: StoreType;

  constructor() {
    this.data = {
      rooms: new Map(),
      socketConnections: new Set(),
    };
  }

  public createRoom(roomName: string, userName: string): [roomId: string, hostId: string] {
    const roomId = generateUUID();
    const hostId = generateUUID();
    
    const room: Room = {
      id: roomId,
      name: roomName,
      createdAt: new Date(),
      connections: new Map([
        [
          hostId,
          {
            id: hostId,
            socketId: "",
            userName: userName,
            isHost: true,
            joinedAt: new Date().getTime(),
            isMuted: false,
            isJoinedInAudioChat: false,
          },
        ],
      ]),
      messages: [],
    };
    this.data.rooms.set(roomId, room);
    return [roomId, hostId];
  }

  public joinRoom(roomId: string, userName: string): string {
    const userId = generateUUID();
    const room = this.data.rooms.get(roomId);
    if (!room) {
      throw new CustomError(404, "Room not found");
    }
    room.connections.set(userId, {
      id: userId,
      socketId: "",
      userName: userName,
      isHost: false,
      joinedAt: new Date().getTime(),
      isMuted: false,
      isJoinedInAudioChat: false,
    });
    return userId;
  }

  public updateUserSocketId(roomId: string, userId: string, socketId: string): Connection {
    const room = this.data.rooms.get(roomId);
    if (!room) {
      throw new CustomError(404, "Room not found");
    }
    const connection = room.connections.get(userId);
    if (!connection) {
      throw new CustomError(404, "User not found");
    }

    connection.socketId = socketId;
    connection.isMuted = false;

    return connection;
  }

  public getSocketConnections(): Set<string> {
    return this.data.socketConnections;
  }

  public addSocketConnection(socketId: string): void {
    this.data.socketConnections.add(socketId);
  }

  public removeSocketConnection(socketId: string): void {
    this.data.socketConnections.delete(socketId);
  }

  public getRoom(roomId: string): Room | null {
    return this.data.rooms.get(roomId) ?? null;
  }

  public getRooms(): Room[] {
    return Array.from(this.data.rooms.values());
  }

  public addMessage(roomId: string, userId: string, content: string): Message {
    const room = this.data.rooms.get(roomId);
    if (!room) {
      throw new CustomError(404, "Room not found");
    }
    const message: Message = {
      id: generateUUID(),
      content,
      createdAt: new Date().getTime(),
      senderId: userId,
    };
    room.messages.push(message);
    return message;
  }
}