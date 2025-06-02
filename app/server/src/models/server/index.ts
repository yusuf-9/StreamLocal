import express, { Express, Router, Request, Response, NextFunction } from "express";
import path from "path";
import Store from "../store";
import CustomError from "../error";
import cors from "cors";

export class Server {
  private app: Express;
  private store: Store;
  private port: number;

  constructor(store: Store) {
    this.app = express();
    this.store = store;
    this.port = parseInt(process.env.PORT || "3000");
    this.setupMiddleware();
    this.configureEndpoints();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Handle static files from public folder
    const publicPath = path.join(__dirname, "../../../public/");
    this.app.use(express.static(publicPath));
    this.app.use(express.json());
    this.app.use(cors());
  }

  private configureEndpoints(): void {
    const apiRouter = Router();

    // API endpoints
    apiRouter.post("/create-room", async (req, res, next) => {
      try {
        const { roomName, userName } = req.body;

        if (!roomName || !userName) {
          throw new CustomError(400, "Room name and user name are required");
        }

        const trimmedRoomName = roomName.trim();
        const trimmedUserName = userName.trim();

        if (trimmedRoomName.length < 3) {
          throw new CustomError(400, "Room name must be at least 3 characters long");
        }

        if (trimmedUserName.length < 3) {
          throw new CustomError(400, "User name must be at least 3 characters long");
        }

        const [roomId, userId] = this.store.createRoom(trimmedRoomName, trimmedUserName);

        res.status(201).json({ message: "Room created successfully", roomId, userId });
      } catch (error) {
        next(error);
      }
    });

    apiRouter.post("/join-room", (req, res, next) => {
      try {
        const { roomId, userName } = req.body;

        if (!roomId || !userName) {
          throw new CustomError(400, "Room id and user name are required");
        }

        const trimmedUserName = userName.trim();
        if (trimmedUserName.length < 3) {
          throw new CustomError(400, "User name must be at least 3 characters long");
        }

        const userId = this.store.joinRoom(roomId, trimmedUserName);

        res.status(201).json({ message: "Room joined successfully", roomId, userId });
      } catch (error) {
        next(error);
      }
    });

    apiRouter.get("/room/:roomId", (req, res, next) => {
      try {
        const { roomId } = req.params;
        const room = this.store.getRoom(roomId);
        if (!room) {
          throw new CustomError(404, "Room not found");
        }

        const roomData = {
          name: room.name,
          users: Array.from(room.connections.values()),
          messages: room.messages,
          streams: room.streams
        };

        res.status(200).json(roomData);
      } catch (error) {
        next(error);
      }
    });

    // Mount API router at /api
    this.app.use("/api", apiRouter);

    // Serve static HTML files for root-level routes
    const publicPath = path.join(__dirname, "../../public");

    this.app.get("/", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });

    this.app.get("/room", (req, res) => {
      res.sendFile(path.join(publicPath, "room.html"));
    });

    this.app.use((req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
      res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error",
      });
    });
  }

  public getExpressApp(): Express {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
