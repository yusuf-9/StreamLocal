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

  // webrtc events - audio chat
  SEND_WEBRTC_OFFER_FOR_AUDIO_CHAT: "send-webrtc-offer-for-audio-chat",
  RECEIVE_WEBRTC_OFFER_FOR_AUDIO_CHAT: "receive-webrtc-offer-for-audio-chat",
  SEND_WEBRTC_ANSWER_FOR_AUDIO_CHAT: "send-webrtc-answer-for-audio-chat",
  RECEIVE_WEBRTC_ANSWER_FOR_AUDIO_CHAT: "receive-webrtc-answer-for-audio-chat",
  SEND_WEBRTC_ICE_CANDIDATE_FOR_AUDIO_CHAT: "send-webrtc-ice-candidate-for-audio-chat",
  RECEIVE_WEBRTC_ICE_CANDIDATE_FOR_AUDIO_CHAT: "receive-webrtc-ice-candidate-for-audio-chat",
  JOIN_AUDIO_CHAT: "join-audio-chat",
  LEAVE_AUDIO_CHAT: "leave-audio-chat",
  USER_JOINED_AUDIO_CHAT: "user-joined-audio-chat",
  USER_LEFT_AUDIO_CHAT: "user-left-audio-chat",

  // webrtc events - video stream
  SEND_WEBRTC_OFFER_FOR_VIDEO_STREAM: "send-webrtc-offer-for-video-stream",
  RECEIVE_WEBRTC_OFFER_FOR_VIDEO_STREAM: "receive-webrtc-offer-for-video-stream",
  SEND_WEBRTC_ANSWER_FOR_VIDEO_STREAM: "send-webrtc-answer-for-video-stream",
  RECEIVE_WEBRTC_ANSWER_FOR_VIDEO_STREAM: "receive-webrtc-answer-for-video-stream",
  SEND_WEBRTC_ICE_CANDIDATE_FOR_VIDEO_STREAM: "send-webrtc-ice-candidate-for-video-stream",
  RECEIVE_WEBRTC_ICE_CANDIDATE_FOR_VIDEO_STREAM: "receive-webrtc-ice-candidate-for-video-stream",
  START_VIDEO_STREAM: "start-video-stream",
  STOP_VIDEO_STREAM: "stop-video-stream",
  USER_STARTED_VIDEO_STREAM: "user-started-video-stream",
  USER_STOPPED_VIDEO_STREAM: "user-stopped-video-stream",

  // audio status events
  AUDIO_STATUS_CHANGED: "audio-status-changed",
  USER_AUDIO_STATUS_CHANGED: "user-audio-status-changed",
};
