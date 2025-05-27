import Store from "./models/store";
import { Server } from "./models/server";
import Socket from "./models/ws";

class App {
  private store: Store;
  private server: Server;
  private socket: Socket;

  constructor() {
    // Initialize in order of dependency
    this.store = new Store();
    this.server = new Server(this.store);
    this.socket = new Socket(this.server.getExpressApp(), this.store);
  }

  public start(): void {
    this.socket.start(3000);
  }
}

// Start the application
const app = new App();
app.start(); 
