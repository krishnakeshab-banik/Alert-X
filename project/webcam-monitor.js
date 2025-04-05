// Webcam Monitor - Ensures webcam streams stay active

// Start monitoring webcam streams
function startWebcamMonitor() {
    console.log('Starting webcam monitor');
    
    // Check webcam streams every 3 seconds
    setInterval(() => {
        // Only proceed if we have cameras
        if (!window.liveFinder || !window.liveFinder.cameras || window.liveFinder.cameras.length === 0) {
            return;
        }
        
        // Check each camera
        window.liveFinder.cameras.forEach(camera => {
            // Only check webcam cameras
            if (camera.type === 'webcam' && camera.stream) {
                console.log(`Checking webcam stream for camera: ${camera.id}`);
                
                // Check if the stream has active tracks
                const videoTracks = camera.stream.getVideoTracks();
                if (videoTracks.length === 0) {
                    console.warn(`No video tracks in webcam stream for camera: ${camera.id}`);
                    return;
                }
                
                // Check track state
                const track = videoTracks[0];
                console.log(`Webcam track state for ${camera.id}: ${track.readyState}, enabled: ${track.enabled}`);
                
                // Make sure the track is enabled
                if (!track.enabled) {
                    console.log(`Re-enabling track for camera: ${camera.id}`);
                    track.enabled = true;
                }
                
                // Find the video element for this camera
                const cameraCell = document.querySelector(`.camera-cell[data-id="${camera.id}"]`);
                if (!cameraCell) {
                    console.warn(`Camera cell not found for camera: ${camera.id}`);
                    return;
                }
                
                const videoElement = cameraCell.querySelector('video');
                if (!videoElement) {
                    console.warn(`Video element not found for camera: ${camera.id}`);
                    return;
                }
                
                // Check if the video is playing
                if (videoElement.paused || videoElement.ended) {
                    console.log(`Video is not playing for camera: ${camera.id}, attempting to restart`);
                    
                    // Try to play the video
                    videoElement.play().catch(err => {
                        console.error(`Error restarting video for camera: ${camera.id}`, err);
                    });
                }
            }
        });
    }, 3000);
}

// Start the monitor when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure everything is loaded
    setTimeout(startWebcamMonitor, 2000);
});