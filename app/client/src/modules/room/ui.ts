import store from "./store";

export function initializeRoomUI() {
  // Initialize DOM elements
  const elements = {
    leftSidebar: document.getElementById("leftSidebar")!,
    rightSidebar: document.getElementById("rightSidebar")!,
    toggleLeft: document.getElementById("toggleLeft")!,
    toggleRight: document.getElementById("toggleRight")!,
    floatingLeftToggle: document.getElementById("floatingLeftToggle")!,
    floatingRightToggle: document.getElementById("floatingRightToggle")!
  };

  // Initialize mobile state
  store.isMobile = window.innerWidth < 1024;
  if (store.isMobile) {
    store.isLeftSidebarOpen = true;
    store.isRightSidebarOpen = true;
  }

  // Update layout function
  function updateLayout(): void {
    if (store.isMobile) {
      // Mobile layout
      if (store.isLeftSidebarOpen) {
        elements.leftSidebar.classList.add("sidebar-mobile");
        elements.leftSidebar.classList.remove("open");
        elements.floatingLeftToggle.classList.remove("hidden");
      } else {
        elements.leftSidebar.classList.add("sidebar-mobile", "open");
        elements.floatingLeftToggle.classList.add("hidden");
      }

      if (store.isRightSidebarOpen) {
        elements.rightSidebar.classList.add("sidebar-mobile-right");
        elements.rightSidebar.classList.remove("open");
        elements.floatingRightToggle.classList.remove("hidden");
      } else {
        elements.rightSidebar.classList.add("sidebar-mobile-right", "open");
        elements.floatingRightToggle.classList.add("hidden");
      }

      // Add overlay when sidebar is open
      if (!store.isLeftSidebarOpen || !store.isRightSidebarOpen) {
        if (!document.getElementById("mobileOverlay")) {
          const overlay = document.createElement("div");
          overlay.id = "mobileOverlay";
          overlay.className = "fixed inset-0 bg-black/50 z-30 lg:hidden";
          overlay.addEventListener("click", () => {
            store.isLeftSidebarOpen = true;
            store.isRightSidebarOpen = true;
            updateLayout();
          });
          document.body.appendChild(overlay);
        }
      } else {
        const overlay = document.getElementById("mobileOverlay");
        if (overlay) overlay.remove();
      }
    } else {
      // Desktop layout
      elements.leftSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");
      elements.rightSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");

      if (store.isLeftSidebarOpen) {
        elements.leftSidebar.style.width = "0px";
        elements.leftSidebar.style.minWidth = "0px";
        elements.leftSidebar.style.overflow = "hidden";
        elements.floatingLeftToggle.classList.remove("hidden");
      } else {
        elements.leftSidebar.style.width = "320px";
        elements.leftSidebar.style.minWidth = "320px";
        elements.leftSidebar.style.overflow = "visible";
        elements.floatingLeftToggle.classList.add("hidden");
      }

      if (store.isRightSidebarOpen) {
        elements.rightSidebar.style.width = "0px";
        elements.rightSidebar.style.minWidth = "0px";
        elements.rightSidebar.style.overflow = "hidden";
        elements.floatingRightToggle.classList.remove("hidden");
      } else {
        elements.rightSidebar.style.width = "320px";
        elements.rightSidebar.style.minWidth = "320px";
        elements.rightSidebar.style.overflow = "visible";
        elements.floatingRightToggle.classList.add("hidden");
      }

      // Remove mobile overlay
      const overlay = document.getElementById("mobileOverlay");
      if (overlay) overlay.remove();
    }
  }

  // Toggle functions
  function toggleLeftSidebar(): void {
    store.isLeftSidebarOpen = !store.isLeftSidebarOpen;
    updateLayout();

    if (!store.isMobile) {
      // Update arrow for desktop
      if (store.isLeftSidebarOpen) {
        elements.toggleLeft.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    `;
      } else {
        elements.toggleLeft.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    `;
      }
    }
  }

  function toggleRightSidebar(): void {
    store.isRightSidebarOpen = !store.isRightSidebarOpen;
    updateLayout();

    if (!store.isMobile) {
      // Update arrow for desktop
      if (store.isRightSidebarOpen) {
        elements.toggleRight.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    `;
      } else {
        elements.toggleRight.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    `;
      }
    }
  }

  // Set up event listeners
  window.addEventListener("resize", () => {
    store.isMobile = window.innerWidth < 1024;
    updateLayout();
  });

  elements.toggleLeft.addEventListener("click", toggleLeftSidebar);
  elements.toggleRight.addEventListener("click", toggleRightSidebar);
  elements.floatingLeftToggle.addEventListener("click", toggleLeftSidebar);
  elements.floatingRightToggle.addEventListener("click", toggleRightSidebar);

  // Initialize layout
  updateLayout();

  // Return cleanup function
  return () => {
    window.removeEventListener("resize", updateLayout);
    elements.toggleLeft.removeEventListener("click", toggleLeftSidebar);
    elements.toggleRight.removeEventListener("click", toggleRightSidebar);
    elements.floatingLeftToggle.removeEventListener("click", toggleLeftSidebar);
    elements.floatingRightToggle.removeEventListener("click", toggleRightSidebar);
    const overlay = document.getElementById("mobileOverlay");
    if (overlay) overlay.remove();
  };
}
