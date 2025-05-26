import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Express } from 'express';
import Store from '../store';
import { EVENTS } from '../../constants';

export class Socket {
  private io: SocketServer;
  private store: Store;
  private httpServer: HTTPServer;

  constructor(app: Express, store: Store) {
    this.httpServer = new HTTPServer(app);
    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
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
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      this.store.addSocketConnection(socket.id);

      socket.on(EVENTS.JOIN_ROOM, (payload: { roomId: string, userId: string }) => {
        const room = this.store.getRoom(payload.roomId);
        if (!room) {
          socket.emit(EVENTS.ERROR, "Room not found");
          return;
        }

        socket.join(payload.roomId);
        const socketConnection = this.store.updateUserSocketId(payload.roomId, payload.userId, socket.id);

        socket.emit(EVENTS.JOINED_ROOM, socketConnection);
        this.io.to(payload.roomId).emit(EVENTS.USER_JOINED, socketConnection);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public getSocketServer(): SocketServer {
    return this.io;
  }
} 