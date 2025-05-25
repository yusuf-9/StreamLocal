export interface Store {
    rooms: Map<string, Room>;
    socketConnections: Set<string>;
}

export interface Room {
    id: string;
    name: string;
    createdAt: Date;
    connections: Map<string, Connection>;
}

export interface Connection {
    id: string;
    socketId: string;
    userName: string;
}