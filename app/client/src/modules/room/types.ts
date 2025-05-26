export interface RoomState {
    roomId: string;
    roomName: string;
    members: Member[];
    messages: Message[];
    user: Member | null;
}

export interface RoomPageState {
    isMobile: boolean;
    isLeftSidebarOpen: boolean;
    isRightSidebarOpen: boolean;
}

export interface Member {
    id: string;
    userName: string;
    socketId: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
}
