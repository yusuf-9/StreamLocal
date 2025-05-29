import RoomManager from "./roomManager";

document.addEventListener("DOMContentLoaded", async () => {
  const roomManager = new RoomManager();
  await roomManager.initialize();
});