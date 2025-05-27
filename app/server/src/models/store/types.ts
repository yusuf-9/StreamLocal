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
}

export interface Connection {
    id: string;
    socketId: string;
    userName: string;
    isHost: boolean;
    joinedAt: number;
}

export interface Message {
    id: string;
    content: string;
    createdAt: number;
    senderId: string;
}
