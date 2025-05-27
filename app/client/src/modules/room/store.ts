import type { RoomState } from "./types";

const store: RoomState = {
    room: {
        id: '',
        name: '',
        members: [],
        messages: [],
    },
    user: null,
    isMobile: window.innerWidth < 1024,
    isLeftSidebarOpen: false,
    isRightSidebarOpen: false,
    isRoomLoaded: false
}

export default store;
