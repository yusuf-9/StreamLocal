export const QUERY_PARAM_KEYS = {
  ROOM_ID: "id",
  USER_ID: "userId",
};

export const EVENTS = {
  // user-specific events
  JOIN_ROOM: "join-room",
  JOINED_ROOM: "joined-room",
  LEAVE_ROOM: "leave-room",

  // room-specific events
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",
  ERROR: "error",
};
