export interface RoomState {
    room: {
        id: string;
        name: string;
        members: Member[];
        messages: Message[];
        streams: Stream[];
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
    isJoinedInAudioChat: boolean;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: number;
}

export interface Stream {
    id: string;
    userId: Member['id'];
    type: "audio-chat" | "video-stream" | "video-stream-audio";
}
