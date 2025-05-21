document.addEventListener('DOMContentLoaded', () => {
  const continueButton = document.getElementById('continueButton') as HTMLButtonElement;
  const inputField = document.getElementById('inputField') as HTMLInputElement;
  const formTitle = document.getElementById('formTitle') as HTMLElement;
  const formSubtitle = document.getElementById('formSubtitle') as HTMLElement;
  
  let roomName = '';
  let step = 1;
  
  continueButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // First step - collect room name
      roomName = inputField.value.trim();
      
      if (!roomName) {
        alert('Please enter a room name');
        return;
      }
      
      // Move to second step
      formTitle.textContent = 'Enter Your Name';
      formSubtitle.textContent = 'Join the collaboration room';
      inputField.value = '';
      inputField.placeholder = 'Enter your name';
      step = 2;
      
    } else if (step === 2) {
      // Second step - collect user name and redirect
      const userName = inputField.value.trim();
      
      if (!userName) {
        alert('Please enter your name');
        return;
      }
      
      // Redirect to room.html with query parameters
      window.location.href = `/room.html?room=${encodeURIComponent(roomName)}&user=${encodeURIComponent(userName)}`;
    }
  });
});
