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
    const publicPath = path.join(__dirname, "../../public");
    this.app.use(express.static(publicPath));
    this.app.use(express.json());
    this.app.use(cors());
  }

  private configureEndpoints(): void {
    const router = Router();

    router.get("/", (req, res) => {
      res.send("Hello World");
    });

    router.post("/create-room", async (req, res, next) => {
      try {
        const { roomName, userName } = req.body;

        // Validate required fields
        if (!roomName || !userName) {
          throw new CustomError(400, "Room name and user name are required");
        }

        // Trim inputs
        const trimmedRoomName = roomName.trim();
        const trimmedUserName = userName.trim();

        // Validate room name length
        if (trimmedRoomName.length < 3) {
          throw new CustomError(400, "Room name must be at least 3 characters long");
        }

        // Validate user name length
        if (trimmedUserName.length < 3) {
          throw new CustomError(400, "User name must be at least 3 characters long");
        }

        // Create the room
        const [roomId, userId] = this.store.createRoom(roomName, trimmedUserName);

        res.status(201).json({
          message: "Room created successfully",
          roomId,
          userId,
        });
      } catch (error) {
        next(error);
      }
    });

    router.post("/join-room", (req, res, next) => {
      try {
        const { roomId, userName } = req.body;

        // Validate required fields
        if (!roomId || !userName) {
          throw new CustomError(400, "Room id and user name are required");
        }

        // Validate user name length
        const trimmedUserName = userName.trim();
        if (trimmedUserName.length < 3) {
          throw new CustomError(400, "User name must be at least 3 characters long");
        }

        // Create the room
        const userId = this.store.joinRoom(roomId, trimmedUserName);

        // For now, just return success
        res.status(201).json({
          message: "Room joined successfully",
          roomId,
          userId,
        });
      } catch (error) {
        next(error);
      }
    });

    // Mount all API routes under /api
    this.app.use("/api", router);
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
