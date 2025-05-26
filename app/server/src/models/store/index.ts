import { Room, Store as StoreType, Connection } from "./types";
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
      isHost: false
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
}
