/**
 * Sets up the video player functionality
 */
export function setupVideoPlayer(): void {
  const videoFileInput = document.getElementById('videoFileInput') as HTMLInputElement;
  const videoSelectArea = document.getElementById('videoSelectArea') as HTMLDivElement;
  const videoPlayerArea = document.getElementById('videoPlayerArea') as HTMLDivElement;
  const videoPlayer = document.getElementById('videoPlayer') as HTMLVideoElement;
  const videoFileName = document.getElementById('videoFileName') as HTMLHeadingElement;
  const videoFileSize = document.getElementById('videoFileSize') as HTMLParagraphElement;
  const selectDifferentVideo = document.getElementById('selectDifferentVideo') as HTMLButtonElement;
  const middleContent = document.getElementById('middleContent') as HTMLDivElement;

  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to ensure video fits within container
  const resizeVideoToFit = () => {
    // Get the container dimensions
    const containerWidth = middleContent.clientWidth - 48; // Subtract padding (24px on each side)
    const containerHeight = middleContent.clientHeight - 48 - 72; // Subtract padding and control bar height
    
    // Set max dimensions for the video
    videoPlayer.style.maxWidth = `${containerWidth}px`;
    videoPlayer.style.maxHeight = `${containerHeight}px`;
  };

  // Handle window resize
  window.addEventListener('resize', resizeVideoToFit);

  // Handle file selection
  videoFileInput.addEventListener('change', (event) => {
    const files = (event.target as HTMLInputElement).files;
    
    if (files && files.length > 0) {
      const file = files[0];
      const videoURL = URL.createObjectURL(file);
      
      // Update video player
      videoPlayer.src = videoURL;
      videoFileName.textContent = file.name;
      videoFileSize.textContent = formatFileSize(file.size);
      
      // Show video player, hide selection area
      videoSelectArea.classList.add('hidden');
      videoPlayerArea.classList.remove('hidden');
      
      // Ensure video fits within container
      resizeVideoToFit();
      
      // Add metadata loaded event to resize again once video dimensions are known
      videoPlayer.addEventListener('loadedmetadata', resizeVideoToFit);
      
      // Auto-play the video
      videoPlayer.play().catch(error => {
        console.error('Auto-play failed:', error);
      });
    }
  });

  // Handle selecting a different video
  selectDifferentVideo.addEventListener('click', () => {
    // Reset video player
    videoPlayer.pause();
    videoPlayer.src = '';
    
    // Show selection area, hide video player
    videoPlayerArea.classList.add('hidden');
    videoSelectArea.classList.remove('hidden');
    
    // Reset file input
    videoFileInput.value = '';
  });
} 