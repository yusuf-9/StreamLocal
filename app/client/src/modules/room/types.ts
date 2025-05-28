export interface RoomState {
    room: {
        id: string;
        name: string;
        members: Member[];
        messages: Message[];
    };
    isMobile: boolean;
    isLeftSidebarOpen: boolean;
    isRightSidebarOpen: boolean;
    user: Member | null;
    isRoomLoaded: boolean;
}

export interface Member {
    id: string;
    userName: string;
    socketId: string;
    isHost: boolean;
    joinedAt: number;
    isMuted: boolean;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: number;
}
