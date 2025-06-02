export interface Store {
    rooms: Map<string, Room>;
    socketConnections: Set<string>;
}

export interface Room {
    id: string;
    name: string;
    createdAt: Date;
    connections: Map<string, Connection>;
    messages: Message[];
    streams: Array<Stream>
}

export interface Connection {
    id: string;
    socketId: string;
    userName: string;
    isHost: boolean;
    joinedAt: number;
    isMuted: boolean;
    isJoinedInAudioChat: boolean;
}

export interface Message {
    id: string;
    content: string;
    createdAt: number;
    senderId: string;
}

export interface Stream {
    id: string;
    userId: Connection['id'];
    type: "audio-chat" | "video-stream" | "video-stream-audio";
}
