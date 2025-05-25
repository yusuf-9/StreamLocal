import { QUERY_PARAM_KEYS } from "../../common/constants";

document.addEventListener("DOMContentLoaded", function () {
  loadRoomForm();
  bindAnimations();
});

function bindAnimations() {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor: Element) => {
    (anchor as HTMLAnchorElement).addEventListener("click", function (e: MouseEvent) {
      e.preventDefault();
      const href = (this as HTMLAnchorElement).getAttribute("href");
      if (href) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });
}

async function handleCreateRoom(e: SubmitEvent) {
  e.preventDefault();

  // Reset error text
  const errorText = document.getElementById("errorText") as HTMLDivElement;
  errorText.textContent = "";
  errorText.classList.add("hidden");

  // validate room name
  const roomNameElement = document.getElementById("roomName") as HTMLInputElement;
  const roomName = roomNameElement?.value.trim();

  // validate user name
  const userNameElement = document.getElementById("userName") as HTMLInputElement;
  const userName = userNameElement?.value.trim();

  // validate room name
  if (!roomName) {
    errorText.textContent = "Room name is required";
    errorText.classList.remove("hidden");
    return;
  }

  // validate user name
  if (!userName) {
    errorText.textContent = "User name is required";
    errorText.classList.remove("hidden");
    return;
  }

  // Trim inputs
  const trimmedRoomName = roomName.trim();
  const trimmedUserName = userName.trim();

  // Validate room name length
  if (trimmedRoomName.length < 3) {
    errorText.textContent = "Room name must be at least 3 characters long";
    errorText.classList.remove("hidden");
    return;
  }

  // Validate user name length
  if (trimmedUserName.length < 3) {
    errorText.textContent = "User name must be at least 3 characters long";
    errorText.classList.remove("hidden");
    return;
  }

  // Add loading state
  const form = e.target as HTMLFormElement;
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  button.innerHTML = `
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Room...
              `;
  button.disabled = true;

  // Simulate room creation (replace with actual logic)
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    if (!apiUrl) {
      throw new Error("API URL is not set");
    }

    const response = await fetch(`${apiUrl}/create-room`, {
      method: "POST",
      body: JSON.stringify({ roomName: trimmedRoomName, userName: trimmedUserName }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create room. Please try again later.");
    }

    const data = await response.json();
    const roomId = data.roomId;
    const userId = data.userId;

    // navigate to room page with roomId and hostId as query params
    window.location.href = `room.html?${QUERY_PARAM_KEYS.ROOM_ID}=${roomId}&${QUERY_PARAM_KEYS.USER_ID}=${userId}`;
  } catch (error) {
    console.error(error);
    errorText.textContent = "Failed to create room. Please try again later.";
    errorText.classList.remove("hidden");
  } finally {
    button.innerHTML = "Create Room";
    button.disabled = false;
  }
}

async function handleJoinRoom(e: SubmitEvent) {
  e.preventDefault();
  
  // Reset error text
  const errorText = document.getElementById("errorText") as HTMLDivElement;
  errorText.textContent = "";
  errorText.classList.add("hidden");

  // validate user name
  const userNameElement = document.getElementById("userName") as HTMLInputElement;
  const userName = userNameElement?.value.trim();

  // validate user name
  if (!userName) {
    errorText.textContent = "User name is required";
    errorText.classList.remove("hidden");
    return;
  }

  // Trim inputs
  const trimmedUserName = userName.trim();

  // Validate user name length
  if (trimmedUserName.length < 3) {
    errorText.textContent = "User name must be at least 3 characters long";
    errorText.classList.remove("hidden");
    return;
  }

  // Add loading state
  const form = e.target as HTMLFormElement;
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  button.innerHTML = `
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining Room...
              `;
  button.disabled = true;

  // Simulate room creation (replace with actual logic)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get(QUERY_PARAM_KEYS.ROOM_ID);

    if (!roomId) {
      throw new Error("Room ID is not set");
    }

    const apiUrl = import.meta.env.VITE_API_URL || "";
    if (!apiUrl) {
      throw new Error("API URL is not set");
    }

    const response = await fetch(`${apiUrl}/join-room`, {
      method: "POST",
      body: JSON.stringify({ roomId, userName }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to join room. Please try again later.");
    }

    const data = await response.json();
    const userId = data.userId;

    // navigate to room page with roomId and hostId as query params
    window.location.href = `room.html?${QUERY_PARAM_KEYS.ROOM_ID}=${roomId}&${QUERY_PARAM_KEYS.USER_ID}=${userId}`;
  } catch (error) {
    console.error(error);
    errorText.textContent = "Failed to join room. Please try again later.";
    errorText.classList.remove("hidden");
  } finally {
    button.innerHTML = "Join Room";
    button.disabled = false;
  }
}

async function loadRoomForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get(QUERY_PARAM_KEYS.ROOM_ID);

  const formContainer = document.getElementById("room-form-container")!;

  // if roomId is not present (user isn't using an invite link), show create room form
  if (!roomId) {
    formContainer.innerHTML = `
      <h3 class="text-2xl font-bold mb-6">Create Your Room</h3>
      <form
        id="create-room-form"
        class="space-y-6"
      >
        <div>
          <label
            for="roomName"
            class="block text-sm font-medium text-gray-300 mb-2"
            >Room Name</label
          >
          <input
            type="text"
            id="roomName"
            name="roomName"
            placeholder="Enter room name..."
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label
            for="userName"
            class="block text-sm font-medium text-gray-300 mb-2"
            >Your Name</label
          >
          <input
            type="text"
            id="userName"
            name="userName"
            placeholder="Enter your name..."
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
            required
          />
        </div>
        <div>
          <div id="errorText" class="hidden text-red-500 text-sm mt-2"></div>
        </div>
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Create Room
          <svg
            class="w-5 h-5 ml-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            ></path>
          </svg>
        </button>
      </form>
    `;
    const form = document.getElementById("create-room-form") as HTMLFormElement;
    form.addEventListener("submit", handleCreateRoom);
    return;
  }

  // if roomId is present (user is using an invite link), show join room form
  formContainer.innerHTML = `
    <h3 class="text-2xl font-bold mb-6">Join Your Room</h3>
    <form
        id="join-room-form"
        class="space-y-6"
      >
        <div>
          <p
            class="block text-sm font-medium text-gray-300 mb-2"
            >Room Id: ${roomId}</p>
        </div>
        <div>
          <label
            for="userName"
            class="block text-sm font-medium text-gray-300 mb-2"
            >Your Name</label
          >
          <input
            type="text"
            id="userName"
            name="userName"
            placeholder="Enter your name..."
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
            required
          />
        </div>
        <div>
          <div id="errorText" class="hidden text-red-500 text-sm mt-2"></div>
        </div>
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Join Room
          <svg
            class="w-5 h-5 ml-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            ></path>
          </svg>
        </button>
      </form>
  `;
  const form = document.getElementById("join-room-form") as HTMLFormElement;
  form.addEventListener("submit", handleJoinRoom);
}
