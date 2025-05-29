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

  // webrtc events
  SEND_WEBRTC_OFFER: "send-webrtc-offer",
  RECEIVE_WEBRTC_OFFER: "receive-webrtc-offer",
  SEND_WEBRTC_ANSWER: "send-webrtc-answer",
  RECEIVE_WEBRTC_ANSWER: "receive-webrtc-answer",
  SEND_WEBRTC_ICE_CANDIDATE: "send-webrtc-ice-candidate",
  RECEIVE_WEBRTC_ICE_CANDIDATE: "receive-webrtc-ice-candidate",
  JOIN_AUDIO_CHAT: "join-audio-chat",
  LEAVE_AUDIO_CHAT: "leave-audio-chat",
  USER_JOINED_AUDIO_CHAT: "user-joined-audio-chat",
  USER_LEFT_AUDIO_CHAT: "user-left-audio-chat",

  // audio status events
  AUDIO_STATUS_CHANGED: "audio-status-changed",
  USER_AUDIO_STATUS_CHANGED: "user-audio-status-changed",
};
