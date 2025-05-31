import{Q as l}from"./index-y7ty4Tjl.js";document.addEventListener("DOMContentLoaded",function(){x(),g()});function g(){document.querySelectorAll('a[href^="#"]').forEach(r=>{r.addEventListener("click",function(e){e.preventDefault();const t=this.getAttribute("href");if(t){const o=document.querySelector(t);o&&o.scrollIntoView({behavior:"smooth",block:"start"})}})})}async function b(r){r.preventDefault();const e=document.getElementById("errorText");e.textContent="",e.classList.add("hidden");const t=document.getElementById("roomName"),o=t==null?void 0:t.value.trim(),m=document.getElementById("userName"),f=m==null?void 0:m.value.trim();if(!o){e.textContent="Room name is required",e.classList.remove("hidden");return}if(!f){e.textContent="User name is required",e.classList.remove("hidden");return}const n=o.trim(),s=f.trim();if(n.length<3){e.textContent="Room name must be at least 3 characters long",e.classList.remove("hidden");return}if(s.length<3){e.textContent="User name must be at least 3 characters long",e.classList.remove("hidden");return}const a=r.target.querySelector('button[type="submit"]');a.innerHTML=`
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Room...
              `,a.disabled=!0;try{const i="http://localhost:3000/api",c=await fetch(`${i}/create-room`,{method:"POST",body:JSON.stringify({roomName:n,userName:s}),headers:{"Content-Type":"application/json"}});if(!c.ok)throw new Error("Failed to create room. Please try again later.");const u=await c.json(),h=u.roomId,p=u.userId;window.location.href=`room.html?${l.ROOM_ID}=${h}&${l.USER_ID}=${p}`}catch(i){console.error(i),e.textContent="Failed to create room. Please try again later.",e.classList.remove("hidden")}finally{a.innerHTML="Create Room",a.disabled=!1}}async function y(r){r.preventDefault();const e=document.getElementById("errorText");e.textContent="",e.classList.add("hidden");const t=document.getElementById("userName"),o=t==null?void 0:t.value.trim();if(!o){e.textContent="User name is required",e.classList.remove("hidden");return}if(o.trim().length<3){e.textContent="User name must be at least 3 characters long",e.classList.remove("hidden");return}const n=r.target.querySelector('button[type="submit"]');n.innerHTML=`
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining Room...
              `,n.disabled=!0;try{const d=new URLSearchParams(window.location.search).get(l.ROOM_ID);if(!d)throw new Error("Room ID is not set");const a="http://localhost:3000/api",i=await fetch(`${a}/join-room`,{method:"POST",body:JSON.stringify({roomId:d,userName:o}),headers:{"Content-Type":"application/json"}}),c=await i.json();if(!i.ok)throw new Error(c.error);const u=c.userId;window.location.href=`room.html?${l.ROOM_ID}=${d}&${l.USER_ID}=${u}`}catch(s){console.error(s),e.textContent=s instanceof Error?s.message:"Failed to join room. Please try again later.",e.classList.remove("hidden")}finally{n.innerHTML="Join Room",n.disabled=!1}}async function x(){const e=new URLSearchParams(window.location.search).get(l.ROOM_ID),t=document.getElementById("room-form-container");if(!e){t.innerHTML=`
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
          <div id="errorText" class="hidden text-red-500 text-sm font-semibold mt-2"></div>
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
    `,document.getElementById("create-room-form").addEventListener("submit",b);return}t.innerHTML=`
    <h3 class="text-2xl font-bold mb-6">Join Your Room</h3>
    <form
        id="join-room-form"
        class="space-y-6"
      >
        <div>
          <p
            class="block text-sm font-medium text-gray-300 mb-2"
            >Room Id: ${e}</p>
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
          <div id="errorText" class="hidden text-red-500 text-sm font-semibold mt-2"></div>
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
  `,document.getElementById("join-room-form").addEventListener("submit",y)}
