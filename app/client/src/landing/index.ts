document.addEventListener("DOMContentLoaded", function () {
  // Form submission handler
  document.getElementById("roomForm")?.addEventListener("submit", function (e: SubmitEvent) {
    e.preventDefault();

    const roomNameElement = document.getElementById("roomName") as HTMLInputElement;
    const roomName = roomNameElement?.value.trim();

    if (roomName) {
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
      setTimeout(() => {
        // Generate a simple room ID (in real app, this would come from your backend)
        const roomId = Math.random().toString(36).substring(2, 15);

        // Store room info in localStorage (for demo purposes)
        localStorage.setItem(
          "currentRoom",
          JSON.stringify({
            name: roomName,
            id: roomId,
            created: new Date().toISOString(),
          })
        );

        // Redirect to room page (you'll need to create this)
        window.location.href = `room.html?id=${roomId}&name=${encodeURIComponent(roomName)}`;
      }, 1500);
    }
  });

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

  // Add some interactive effects
  document.addEventListener("mousemove", function (e: MouseEvent) {
    const cards = document.querySelectorAll(".feature-card");
    cards.forEach((card: Element) => {
      const cardElement = card as HTMLElement;
      const rect = cardElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        cardElement.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      } else {
        cardElement.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      }
    });
  });

  // Reset card transforms when mouse leaves
  document.addEventListener("mouseleave", function () {
    const cards = document.querySelectorAll(".feature-card");
    cards.forEach((card: Element) => {
      const cardElement = card as HTMLElement;
      cardElement.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  });
});
