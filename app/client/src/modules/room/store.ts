import type { RoomState, RoomPageState } from "./types";

const store : RoomState & RoomPageState = {
    roomId: "",
    roomName: "",
    members: [],
    messages: [],
    user: null,
    isMobile: window.innerWidth < 1024,
    isLeftSidebarOpen: false,
    isRightSidebarOpen: false,
}

export default store;