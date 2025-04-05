// Camera Selection and Webcam Integration

// Global variables
let webcamStream = null;

// Initialize the camera selection functionality
function initCameraSelection() {
    // Override the openAddCameraModal function to use our camera selection modal instead
    window.openAddCameraModal = openCameraSelectionModal;

    // Set up event listeners for camera selection
    document.getElementById('camera-selection-close').addEventListener('click', closeCameraSelectionModal);

    // Camera option buttons
    document.getElementById('laptop-camera-option').addEventListener('click', selectLaptopCamera);
    document.getElementById('other-camera-option').addEventListener('click', selectOtherCamera);

    // Webcam controls
    document.getElementById('webcam-cancel-btn').addEventListener('click', cancelWebcam);
    document.getElementById('webcam-add-btn').addEventListener('click', addWebcamToGrid);
    document.getElementById('webcam-change-btn').addEventListener('click', showWebcamSelection);
    document.getElementById('retry-camera-btn').addEventListener('click', retryWebcamAccess);

    // Initialize Framer Motion animations if available
    if (window.framerMotionIntegration) {
        setupCameraSelectionAnimations();
    }
}

// Helper function to show toast notifications
function showToast(message, type = 'info') {
    // Check if Toastify is available
    if (typeof Toastify !== 'undefined') {
        let backgroundColor;
        let textColor = '#fff';
        let icon;

        switch (type) {
            case 'success':
                backgroundColor = '#10b981';
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                backgroundColor = '#ef4444';
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                backgroundColor = '#f59e0b';
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'info':
            default:
                backgroundColor = 'var(--primary-color)';
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }

        Toastify({
            text: `${icon} ${message}`,
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor,
            stopOnFocus: true,
            className: 'toast-notification',
            escapeMarkup: false
        }).showToast();
    } else {
        // Fallback to console if Toastify is not available
        console.log(`Toast (${type}): ${message}`);
    }
}

// Open the camera selection modal
function openCameraSelectionModal() {
    console.log('Opening camera selection modal');

    // Get the maximum number of cameras allowed
    const maxCameras = window.liveFinder && window.liveFinder.maxCameras ? window.liveFinder.maxCameras : 10;

    // Make sure liveFinder.cameras exists
    if (!window.liveFinder) {
        window.liveFinder = {};
    }

    if (!window.liveFinder.cameras) {
        window.liveFinder.cameras = [];
    }

    // Check if we've reached the maximum number of cameras
    // Don't count sample cameras if this is the first user camera
    let cameraCount = window.liveFinder.cameras.length;
    let hasSampleCameras = window.liveFinder.cameras.length > 0 &&
                          window.liveFinder.cameras[0].id.startsWith('camera-');

    // If we only have sample cameras and user is adding their first camera,
    // we'll replace the samples, so don't count them against the limit
    if (hasSampleCameras && cameraCount > 0) {
        cameraCount = 0;
    }

    if (cameraCount >= maxCameras) {
        showToast(`Maximum of ${maxCameras} cameras allowed`, 'error');
        return;
    }

    const modal = document.getElementById('camera-selection-modal');
    if (!modal) {
        console.error('Camera selection modal not found in the DOM!');
        return;
    }

    modal.classList.add('active');
    console.log('Camera selection modal activated');

    // Apply Framer Motion animation if available
    if (window.framerMotionIntegration && window.framerMotion) {
        animateModalOpen();
    }
}

// Flag to indicate if we're adding the webcam to the grid
let addingWebcamToGrid = false;

// Close the camera selection modal
function closeCameraSelectionModal() {
    const modal = document.getElementById('camera-selection-modal');

    // Apply Framer Motion animation if available
    if (window.framerMotionIntegration && window.framerMotion) {
        animateModalClose(modal);
    } else {
        modal.classList.remove('active');
    }

    // Only stop the webcam stream if we're not adding it to the grid
    if (!addingWebcamToGrid) {
        console.log('Closing modal normally, stopping webcam stream');
        stopWebcamStream();
    } else {
        console.log('Closing modal after adding webcam to grid, keeping stream active');
        // Reset the flag
        addingWebcamToGrid = false;
    }

    // Reset UI state
    document.getElementById('webcam-preview-section').classList.remove('active');
    document.getElementById('no-camera-access').classList.remove('active');
}

// Select laptop camera option
function selectLaptopCamera() {
    console.log('Laptop camera option selected');

    // Hide any previous error messages
    const errorElement = document.getElementById('no-camera-access');
    if (errorElement) {
        errorElement.classList.remove('active');
    } else {
        console.error('No camera access element not found!');
    }

    // Hide webcam selection section if it was previously shown
    const webcamSelectionSection = document.getElementById('webcam-selection-section');
    if (webcamSelectionSection) {
        webcamSelectionSection.classList.remove('active');
    }

    // Show webcam selection UI (which will handle single webcam case automatically)
    showWebcamSelection();

    // Apply animation to the selected option
    if (window.framerMotionIntegration) {
        animateOptionSelection('laptop-camera-option');
    }
}

// Select other camera option
function selectOtherCamera() {
    // Close the camera selection modal
    closeCameraSelectionModal();

    // Open the regular add camera modal
    document.getElementById('add-camera-modal').classList.add('active');

    // Apply animation to the selected option
    if (window.framerMotionIntegration) {
        animateOptionSelection('other-camera-option');
    }
}

// Global variable to store available webcams
let availableWebcams = [];

// Get list of available webcams
async function getAvailableWebcams() {
    console.log('Getting available webcams...');

    // Check if browser supports enumerateDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.error("Browser doesn't support enumerateDevices");
        return [];
    }

    try {
        // First request camera permission
        await navigator.mediaDevices.getUserMedia({ video: true });

        // Then enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Filter for video input devices (webcams)
        const webcams = devices.filter(device => device.kind === 'videoinput');

        console.log('Found', webcams.length, 'webcams:', webcams);
        return webcams;
    } catch (error) {
        console.error("Error enumerating webcams:", error);
        return [];
    }
}

// Show webcam selection UI
async function showWebcamSelection() {
    console.log('Showing webcam selection UI...');

    // Get available webcams
    availableWebcams = await getAvailableWebcams();

    if (availableWebcams.length === 0) {
        showWebcamError("No webcams found on your device.");
        return;
    }

    if (availableWebcams.length === 1) {
        // If only one webcam, use it directly
        console.log('Only one webcam found, using it directly');
        startWebcam(availableWebcams[0].deviceId);
        return;
    }

    // Show webcam selection UI
    const webcamSelectionSection = document.getElementById('webcam-selection-section');
    const webcamList = document.getElementById('webcam-list');

    // Clear previous list
    webcamList.innerHTML = '';

    // Add each webcam to the list
    availableWebcams.forEach((webcam, index) => {
        const webcamOption = document.createElement('div');
        webcamOption.className = 'webcam-option';

        // Create a more user-friendly name
        const webcamName = webcam.label || `Webcam ${index + 1}`;

        webcamOption.innerHTML = `
            <div class="webcam-option-icon">
                <i class="fas fa-camera"></i>
            </div>
            <div class="webcam-option-details">
                <div class="webcam-option-name">${webcamName}</div>
                <div class="webcam-option-id">${webcam.deviceId.substring(0, 8)}...</div>
            </div>
        `;

        webcamOption.addEventListener('click', () => {
            startWebcam(webcam.deviceId);
            webcamSelectionSection.classList.remove('active');
        });

        webcamList.appendChild(webcamOption);
    });

    // Show the webcam selection section
    webcamSelectionSection.classList.add('active');

    // Apply animation if available
    if (window.framerMotionIntegration) {
        window.framerMotionIntegration.animateElement(webcamSelectionSection, {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, ease: 'easeOut' }
        });
    }
}

// Start webcam stream with specific deviceId
function startWebcam(deviceId = null) {
    console.log('Starting webcam...', deviceId ? `with device ID: ${deviceId}` : 'with default device');

    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Browser doesn't support getUserMedia");
        showWebcamError("Your browser doesn't support webcam access");
        return;
    }

    // If there's an existing stream, stop it first
    if (webcamStream) {
        console.log('Stopping existing webcam stream');
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }

    console.log('Requesting webcam access...');

    // Set up constraints with standard quality (higher quality might cause issues)
    const constraints = {
        video: deviceId
            ? {
                deviceId: { exact: deviceId },
                width: { ideal: 640 },
                height: { ideal: 480 }
              }
            : {
                width: { ideal: 640 },
                height: { ideal: 480 }
              },
        audio: false
    };

    // Request webcam access
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            console.log('Webcam access granted!');

            // Store the stream for later use
            webcamStream = stream;

            // Get the track settings to show webcam info
            const videoTrack = stream.getVideoTracks()[0];
            if (!videoTrack) {
                console.error('No video track in webcam stream');
                showWebcamError("Could not get video from your webcam");
                return;
            }

            const settings = videoTrack.getSettings();
            console.log('Webcam settings:', settings);
            console.log('Webcam track state:', videoTrack.readyState);
            console.log('Webcam track enabled:', videoTrack.enabled);

            // Make sure the track is enabled
            videoTrack.enabled = true;

            // Display the webcam feed
            const videoElement = document.getElementById('webcam-video');
            if (!videoElement) {
                console.error('Webcam video element not found!');
                return;
            }

            // Clear any existing source
            if (videoElement.srcObject) {
                videoElement.srcObject = null;
            }

            // Set the new stream
            videoElement.srcObject = stream;
            videoElement.muted = true; // Mute to prevent feedback

            // Add event listeners for debugging
            videoElement.addEventListener('loadedmetadata', () => {
                console.log('Video loadedmetadata event fired');
            });

            videoElement.addEventListener('playing', () => {
                console.log('Video playing event fired');
            });

            // Ensure the video plays
            videoElement.play().then(() => {
                console.log('Preview video started playing');
            }).catch(err => {
                console.error('Error playing preview video:', err);
            });

            // Update webcam name in the preview
            const webcamName = document.getElementById('webcam-name');
            if (webcamName) {
                webcamName.textContent = videoTrack.label || 'Webcam';
            }

            // Show the webcam preview section
            const previewSection = document.getElementById('webcam-preview-section');
            if (!previewSection) {
                console.error('Webcam preview section not found!');
                return;
            }

            previewSection.classList.add('active');
            console.log('Webcam preview section activated');

            // Apply animation if available
            if (window.framerMotionIntegration) {
                animateWebcamPreview();
            }
        })
        .catch(error => {
            console.error("Error accessing webcam:", error);
            showWebcamError("Could not access your webcam. Please check permissions.");
        });
}

// Show webcam error message
function showWebcamError(message) {
    const errorSection = document.getElementById('no-camera-access');
    errorSection.querySelector('p').textContent = message;
    errorSection.classList.add('active');
    
    // Apply animation if available
    if (window.framerMotionIntegration) {
        window.framerMotionIntegration.animateElement(errorSection, {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, ease: 'easeOut' }
        });
    }
}

// Stop webcam stream
function stopWebcamStream() {
    console.log('Stopping webcam stream');

    if (webcamStream) {
        // Log the tracks we're stopping
        console.log('Stopping tracks:', webcamStream.getTracks());

        // Stop all tracks
        webcamStream.getTracks().forEach(track => {
            console.log(`Stopping track: ${track.kind}, state: ${track.readyState}`);
            track.stop();
        });

        // Clear the stream reference
        webcamStream = null;

        // Clear video source
        const videoElement = document.getElementById('webcam-video');
        if (videoElement && videoElement.srcObject) {
            console.log('Clearing video element source');
            videoElement.pause();
            videoElement.srcObject = null;
        }

        console.log('Webcam stream stopped and cleared');
    } else {
        console.log('No webcam stream to stop');
    }
}

// Cancel webcam selection
function cancelWebcam() {
    // Stop the webcam stream
    stopWebcamStream();
    
    // Hide the webcam preview
    document.getElementById('webcam-preview-section').classList.remove('active');
    
    // Apply animation if available
    if (window.framerMotionIntegration) {
        animateWebcamCancel();
    }
}

// Add webcam to camera grid
function addWebcamToGrid() {
    console.log('Adding webcam to grid...');

    // Check if we've reached the maximum number of cameras
    const maxCameras = window.liveFinder && window.liveFinder.maxCameras ? window.liveFinder.maxCameras : 10;

    if (window.liveFinder && window.liveFinder.cameras && window.liveFinder.cameras.length >= maxCameras) {
        showToast(`Maximum of ${maxCameras} cameras allowed`, 'error');
        return;
    }

    // Verify that we have a valid webcam stream
    if (!webcamStream) {
        console.error('No webcam stream available');
        showToast('Webcam stream not available. Please try again.', 'error');
        return;
    }

    // Check if the webcam stream is active
    const videoTracks = webcamStream.getVideoTracks();
    if (videoTracks.length === 0) {
        console.error('No video tracks in webcam stream');
        showToast('No video tracks available. Please try again.', 'error');
        return;
    }

    console.log('Webcam stream has tracks:', videoTracks);
    console.log('Webcam track state:', videoTracks[0].readyState);
    console.log('Webcam track enabled:', videoTracks[0].enabled);

    // Make sure the track is enabled
    videoTracks[0].enabled = true;

    // Get webcam name from the video track
    let webcamName = 'Webcam';
    let webcamResolution = '';

    const videoTrack = videoTracks[0];
    if (videoTrack) {
        webcamName = videoTrack.label || 'Webcam';

        // Get resolution info
        const settings = videoTrack.getSettings();
        if (settings.width && settings.height) {
            webcamResolution = `${settings.width}x${settings.height}`;
        }

        console.log('Webcam settings:', settings);
    }

    // IMPORTANT: Create a new stream by cloning the tracks to ensure it stays active
    // This is crucial to prevent the stream from being stopped when the modal is closed
    console.log('Creating a new MediaStream by cloning the tracks');
    const clonedStream = new MediaStream();

    // Clone each track from the original stream to the new stream
    webcamStream.getTracks().forEach(track => {
        console.log(`Cloning track: ${track.kind}, state: ${track.readyState}`);
        clonedStream.addTrack(track.clone());
    });

    // Log the cloned stream details
    console.log('Cloned stream tracks:', clonedStream.getTracks());

    // Create a new camera object for the webcam with the cloned stream
    const webcamCamera = {
        id: 'webcam-' + Date.now(),
        name: webcamName,
        location: webcamResolution ? `Local Device (${webcamResolution})` : 'Local Device',
        type: 'webcam',
        stream: clonedStream, // Use the cloned stream
        url: 'webcam' // Add a url property for compatibility
    };

    console.log('Created webcam camera object:', webcamCamera);

    // Set a flag to skip loading sample cameras
    window.skipSampleCameras = true;

    // Make sure liveFinder is globally accessible
    if (!window.liveFinder) {
        window.liveFinder = {
            cameras: [],
            maxCameras: 10
        };
    }

    // Clear all existing cameras to ensure only this webcam is displayed
    console.log('Clearing existing cameras to show only the newly added webcam');
    window.liveFinder.cameras = [];

    // Add to the liveFinder cameras array
    window.liveFinder.cameras.push(webcamCamera);
    console.log('Added webcam to cameras array. Total cameras:', window.liveFinder.cameras.length);

    // Create a test video element to verify the cloned stream works
    const testVideo = document.createElement('video');
    testVideo.srcObject = clonedStream;
    testVideo.muted = true;
    testVideo.autoplay = true;
    testVideo.style.position = 'absolute';
    testVideo.style.opacity = '0';
    testVideo.style.pointerEvents = 'none';
    document.body.appendChild(testVideo);

    // Test the cloned stream
    testVideo.play().then(() => {
        console.log('Test video with cloned stream is playing successfully');
        document.body.removeChild(testVideo);

        // Update the camera grid
        if (window.updateCameraGrid) {
            console.log('Calling updateCameraGrid with webcam');
            window.updateCameraGrid();
        } else {
            console.error('updateCameraGrid function not found in global scope');
        }

        // Update camera count
        document.getElementById('active-cameras').textContent = window.liveFinder.cameras.length;

        // Set the flag to indicate we're adding the webcam to the grid
        // This will prevent the stream from being stopped in closeCameraSelectionModal
        addingWebcamToGrid = true;
        console.log('Set addingWebcamToGrid flag to true');

        // Close the modal WITHOUT stopping the original stream
        // The closeCameraSelectionModal function will check the flag
        closeCameraSelectionModal();

        // Show success message
        showToast(`${webcamName} added successfully`, 'success');
    }).catch(err => {
        console.error('Test video with cloned stream failed to play:', err);
        showToast('Could not start webcam stream. Please try again.', 'error');
        document.body.removeChild(testVideo);

        // Try to use the original stream as a fallback
        webcamCamera.stream = webcamStream;

        // Update the camera grid with the original stream
        if (window.updateCameraGrid) {
            console.log('Calling updateCameraGrid with original webcam stream as fallback');
            window.updateCameraGrid();
        }

        // Close the modal
        closeCameraSelectionModal();
    });
}

// Retry webcam access
function retryWebcamAccess() {
    document.getElementById('no-camera-access').classList.remove('active');
    showWebcamSelection();
}

// Set up Framer Motion animations
function setupCameraSelectionAnimations() {
    // Add animation capabilities to the modal elements
    const modal = document.getElementById('camera-selection-modal');
    const container = modal.querySelector('.camera-selection-container');
    const options = modal.querySelectorAll('.camera-option');
    
    // Set initial states
    window.framerMotionIntegration.setInitialState(container, {
        opacity: 0,
        y: 30
    });
    
    options.forEach((option, index) => {
        window.framerMotionIntegration.setInitialState(option, {
            opacity: 0,
            y: 20,
            scale: 0.95
        });
    });
}

// Animate modal opening
function animateModalOpen() {
    const modal = document.getElementById('camera-selection-modal');
    const container = modal.querySelector('.camera-selection-container');
    const options = modal.querySelectorAll('.camera-option');
    
    // Animate container
    window.framerMotionIntegration.animateElement(container, {
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] }
    });
    
    // Animate options with staggered delay
    options.forEach((option, index) => {
        window.framerMotionIntegration.animateElement(option, {
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.4, delay: 0.1 + (index * 0.1), ease: 'easeOut' }
        });
    });
}

// Animate modal closing
function animateModalClose(modal) {
    const container = modal.querySelector('.camera-selection-container');
    
    window.framerMotionIntegration.animateElement(container, {
        animate: { opacity: 0, y: 20 },
        transition: { duration: 0.3, ease: 'easeIn' }
    });
    
    // Remove the active class after animation completes
    setTimeout(() => {
        modal.classList.remove('active');
    }, 300);
}

// Animate option selection
function animateOptionSelection(optionId) {
    const option = document.getElementById(optionId);
    
    window.framerMotionIntegration.animateElement(option, {
        animate: { scale: 1.05 },
        transition: { duration: 0.2, ease: 'easeOut' }
    });
    
    setTimeout(() => {
        window.framerMotionIntegration.animateElement(option, {
            animate: { scale: 1 },
            transition: { duration: 0.2, ease: 'easeOut' }
        });
    }, 200);
}

// Animate webcam preview
function animateWebcamPreview() {
    const previewSection = document.getElementById('webcam-preview-section');
    const webcamContainer = previewSection.querySelector('.webcam-container');
    const controls = previewSection.querySelector('.webcam-controls');
    
    window.framerMotionIntegration.animateElement(webcamContainer, {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
    });
    
    window.framerMotionIntegration.animateElement(controls, {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.1, ease: 'easeOut' }
    });
}

// Animate webcam cancel
function animateWebcamCancel() {
    const previewSection = document.getElementById('webcam-preview-section');
    
    window.framerMotionIntegration.animateElement(previewSection, {
        animate: { opacity: 0, y: 20 },
        transition: { duration: 0.3, ease: 'easeIn' }
    });
    
    setTimeout(() => {
        previewSection.classList.remove('active');
    }, 300);
}

// Make functions globally accessible for direct HTML onclick handlers
window.openCameraSelectionModal = openCameraSelectionModal;
window.selectLaptopCamera = selectLaptopCamera;
window.selectOtherCamera = selectOtherCamera;
window.cancelWebcam = cancelWebcam;
window.addWebcamToGrid = addWebcamToGrid;
window.retryWebcamAccess = retryWebcamAccess;
window.showWebcamSelection = showWebcamSelection;

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Camera selection module loaded');
    initCameraSelection();

    // Double-check that our event listeners are attached
    setTimeout(() => {
        console.log('Verifying camera selection event listeners');
        const addCameraBtn = document.getElementById('add-camera-btn');
        const laptopCameraOption = document.getElementById('laptop-camera-option');

        if (addCameraBtn) {
            console.log('Add camera button found, adding direct event listener');
            addCameraBtn.addEventListener('click', function() {
                console.log('Add camera button clicked');
                openCameraSelectionModal();
            });
        } else {
            console.error('Add camera button not found!');
        }

        if (laptopCameraOption) {
            console.log('Laptop camera option found');
            laptopCameraOption.addEventListener('click', function() {
                console.log('Laptop camera option clicked');
                selectLaptopCamera();
            });
        } else {
            console.error('Laptop camera option not found!');
        }
    }, 1000);
});