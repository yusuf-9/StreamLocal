// Responsive and sidebar toggle functionality
let leftCollapsed = false;
let rightCollapsed = false;
let isMobile = window.innerWidth < 1024;

const leftSidebar = document.getElementById("leftSidebar")!;
const rightSidebar = document.getElementById("rightSidebar")!;
const toggleLeft = document.getElementById("toggleLeft")!;
const toggleRight = document.getElementById("toggleRight")!;
const floatingLeftToggle = document.getElementById("floatingLeftToggle")!;
const floatingRightToggle = document.getElementById("floatingRightToggle")!;

// Check if mobile on resize
window.addEventListener("resize", () => {
  isMobile = window.innerWidth < 1024;
  updateLayout();
});

// Initialize mobile state
if (isMobile) {
  leftCollapsed = true;
  rightCollapsed = true;
}

function updateLayout(): void {
  if (isMobile) {
    // Mobile layout
    if (leftCollapsed) {
      leftSidebar.classList.add("sidebar-mobile");
      leftSidebar.classList.remove("open");
      floatingLeftToggle.classList.remove("hidden");
    } else {
      leftSidebar.classList.add("sidebar-mobile", "open");
      floatingLeftToggle.classList.add("hidden");
    }

    if (rightCollapsed) {
      rightSidebar.classList.add("sidebar-mobile-right");
      rightSidebar.classList.remove("open");
      floatingRightToggle.classList.remove("hidden");
    } else {
      rightSidebar.classList.add("sidebar-mobile-right", "open");
      floatingRightToggle.classList.add("hidden");
    }

    // Add overlay when sidebar is open
    if (!leftCollapsed || !rightCollapsed) {
      if (!document.getElementById("mobileOverlay")) {
        const overlay = document.createElement("div");
        overlay.id = "mobileOverlay";
        overlay.className = "fixed inset-0 bg-black/50 z-30 lg:hidden";
        overlay.addEventListener("click", () => {
          leftCollapsed = true;
          rightCollapsed = true;
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
    leftSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");
    rightSidebar.classList.remove("sidebar-mobile", "sidebar-mobile-right", "open");

    if (leftCollapsed) {
      leftSidebar.style.width = "0px";
      leftSidebar.style.minWidth = "0px";
      leftSidebar.style.overflow = "hidden";
      floatingLeftToggle.classList.remove("hidden");
    } else {
      leftSidebar.style.width = "320px";
      leftSidebar.style.minWidth = "320px";
      leftSidebar.style.overflow = "visible";
      floatingLeftToggle.classList.add("hidden");
    }

    if (rightCollapsed) {
      rightSidebar.style.width = "0px";
      rightSidebar.style.minWidth = "0px";
      rightSidebar.style.overflow = "hidden";
      floatingRightToggle.classList.remove("hidden");
    } else {
      rightSidebar.style.width = "320px";
      rightSidebar.style.minWidth = "320px";
      rightSidebar.style.overflow = "visible";
      floatingRightToggle.classList.add("hidden");
    }

    // Remove mobile overlay
    const overlay = document.getElementById("mobileOverlay");
    if (overlay) overlay.remove();
  }
}

// Toggle functions
function toggleLeftSidebar(): void {
  leftCollapsed = !leftCollapsed;
  updateLayout();

  if (!isMobile) {
    // Update arrow for desktop
    if (leftCollapsed) {
      toggleLeft.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    `;
    } else {
      toggleLeft.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    `;
    }
  }
}

function toggleRightSidebar(): void {
  rightCollapsed = !rightCollapsed;
  updateLayout();

  if (!isMobile) {
    // Update arrow for desktop
    if (rightCollapsed) {
      toggleRight.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    `;
    } else {
      toggleRight.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    `;
    }
  }
}

// Event listeners
toggleLeft.addEventListener("click", toggleLeftSidebar);
toggleRight.addEventListener("click", toggleRightSidebar);
floatingLeftToggle.addEventListener("click", toggleLeftSidebar);
floatingRightToggle.addEventListener("click", toggleRightSidebar);

// Initialize layout
updateLayout();
