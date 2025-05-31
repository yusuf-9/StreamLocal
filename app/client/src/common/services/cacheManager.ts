import { LOCAL_STORAGE_KEYS } from "../constants";

export default class CacheManager {
    static getCachedRoomId() {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ROOM_ID);
    }

    static setCachedRoomId(roomId: string) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ROOM_ID, roomId);
    }

    static getCachedUserId() {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);
    }

    static setCachedUserId(userId: string) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ID, userId);
    }
}