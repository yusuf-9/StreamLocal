import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Express } from 'express';
import Store from '../store';

export class Socket {
  private io: SocketServer;
  private store: Store;

  constructor(app: Express, store: Store) {
    const httpServer = new HTTPServer(app);
    this.io = new SocketServer(httpServer);
    this.store = store;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      // // Example event listener
      // socket.on('getData', (key: string) => {
      //   const data = this.store.getData(key);
      //   socket.emit('dataResponse', data);
      // });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public getSocketServer(): SocketServer {
    return this.io;
  }
} 