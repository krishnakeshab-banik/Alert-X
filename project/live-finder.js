// Live Finder JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Live Finder
    initLiveFinder();

    // Initialize Framer Motion animations if available
    if (window.framerMotionIntegration) {
        console.log('Applying Framer Motion animations to Live Finder');

        // Apply entrance animations after a short delay to ensure DOM is ready
        setTimeout(() => {
            window.framerMotionIntegration.applyEntranceAnimations();
            window.framerMotionIntegration.applyHoverAnimations();
        }, 300);
    }
});

// Global variables
const liveFinder = {
    cameras: [],
    activeDetections: 0,
    incidentsToday: 0,
    activePanel: null,
    layout: 'grid',
    demoStreams: {
        'demo-stream-1': {
            name: 'Street Corner',
            location: 'Downtown',
            url: 'https://demo-streams.alert-x.com/street-corner.mp4'
        },
        'demo-stream-2': {
            name: 'Parking Lot',
            location: 'Shopping Mall',
            url: 'https://demo-streams.alert-x.com/parking-lot.mp4'
        },
        'demo-stream-3': {
            name: 'Building Entrance',
            location: 'Office Complex',
            url: 'https://demo-streams.alert-x.com/building-entrance.mp4'
        },
        'demo-stream-4': {
            name: 'Highway',
            location: 'Interstate 95',
            url: 'https://demo-streams.alert-x.com/highway.mp4'
        },
        'demo-stream-5': {
            name: 'Shopping Mall',
            location: 'City Center',
            url: 'https://demo-streams.alert-x.com/shopping-mall.mp4'
        }
    },
    detectionResults: []
};

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

// Initialize the Live Finder
function initLiveFinder() {
    // Set default max cameras
    liveFinder.maxCameras = 10;

    // Make sure cameras array exists
    if (!liveFinder.cameras) {
        liveFinder.cameras = [];
    }

    // Make liveFinder globally accessible
    window.liveFinder = liveFinder;

    // Make updateCameraLimit globally accessible
    window.updateCameraLimit = updateCameraLimit;

    // Make updateCameraGrid globally accessible
    window.updateCameraGrid = updateCameraGrid;

    // Make showToast globally accessible
    window.showToast = showToast;

    // Set up event listeners
    setupEventListeners();

    // Initialize the camera grid
    updateCameraGrid();

    // For demo purposes, load some sample cameras only if no cameras exist
    // But don't load samples if we're coming from a webcam addition
    if (!window.skipSampleCameras) {
        loadSampleCameras();
    } else {
        console.log('Skipping sample cameras as requested');
        window.skipSampleCameras = false; // Reset the flag
    }

    // Initialize the results panel
    initResultsPanel();

    // Set up traffic analysis chart
    setupTrafficChart();

    // Set up heatmap
    setupHeatmap();

    // Update camera count display
    document.getElementById('active-cameras').textContent = liveFinder.cameras.length;
    document.getElementById('max-cameras').textContent = liveFinder.maxCameras;
}

// Set up event listeners
function setupEventListeners() {
    // Camera controls
    // Note: 'add-camera-btn' event listener is now handled in camera-selection.js
    document.getElementById('layout-grid-btn').addEventListener('click', () => setLayout('grid'));
    document.getElementById('layout-single-btn').addEventListener('click', () => setLayout('single'));

    // Detection tools
    document.getElementById('person-search-btn').addEventListener('click', () => openDetectionPanel('person-search'));
    document.getElementById('vehicle-search-btn').addEventListener('click', () => openDetectionPanel('vehicle-search'));
    document.getElementById('incident-detection-btn').addEventListener('click', () => openDetectionPanel('incident-detection'));
    document.getElementById('traffic-analysis-btn').addEventListener('click', () => openDetectionPanel('traffic-analysis'));

    // Close panel buttons
    document.querySelectorAll('.close-panel-btn').forEach(btn => {
        btn.addEventListener('click', closeDetectionPanel);
    });

    // Person search
    document.getElementById('person-upload-btn').addEventListener('click', () => {
        document.getElementById('person-upload').click();
    });

    document.getElementById('person-upload').addEventListener('change', handlePersonImageUpload);
    document.getElementById('start-person-search').addEventListener('click', startPersonSearch);

    // Vehicle search
    document.getElementById('license-plate').addEventListener('input', handleLicensePlateInput);
    document.getElementById('start-vehicle-search').addEventListener('click', startVehicleSearch);

    // Incident detection
    document.getElementById('start-incident-detection').addEventListener('click', startIncidentDetection);

    // Traffic analysis
    document.getElementById('start-traffic-analysis').addEventListener('click', startTrafficAnalysis);

    // Results panel
    document.querySelector('.minimize-panel-btn').addEventListener('click', toggleResultsPanel);
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchResultsTab(e.target.dataset.tab));
    });

    document.getElementById('export-results-btn').addEventListener('click', exportResults);

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Add camera modal
    document.querySelectorAll('.demo-stream').forEach(btn => {
        btn.addEventListener('click', (e) => selectDemoStream(e.target.dataset.url));
    });

    document.getElementById('test-connection-btn').addEventListener('click', testCameraConnection);
    document.getElementById('save-camera-btn').addEventListener('click', saveCamera);

    // Alert modal
    document.getElementById('dismiss-alert-btn').addEventListener('click', dismissAlert);
    document.getElementById('view-camera-btn').addEventListener('click', viewAlertCamera);
    document.getElementById('report-alert-btn').addEventListener('click', reportEmergency);

    // Floating alert
    document.querySelector('.alert-close').addEventListener('click', closeFloatingAlert);

    // Traffic heatmap modal
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchHeatmapTime(e.target.dataset.time));
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchHeatmapView(e.target.dataset.view));
    });
}

// Update the maximum number of cameras allowed
function updateCameraLimit(limit) {
    // Convert to number
    limit = parseInt(limit, 10);

    // Update the global variable
    liveFinder.maxCameras = limit;

    // Update the display
    document.getElementById('max-cameras').textContent = limit;

    // Show toast notification
    showToast(`Camera limit updated to ${limit}`, 'info');
}

// Open the add camera modal
function openAddCameraModal() {
    const maxCameras = liveFinder.maxCameras || 10;

    if (liveFinder.cameras.length >= maxCameras) {
        showToast(`Maximum of ${maxCameras} cameras allowed`, 'error');
        return;
    }

    document.getElementById('add-camera-modal').classList.add('active');
}

// Set the layout (grid or single)
function setLayout(layout) {
    liveFinder.layout = layout;
    
    if (layout === 'grid') {
        document.getElementById('layout-grid-btn').classList.add('active');
        document.getElementById('layout-single-btn').classList.remove('active');
        document.getElementById('camera-grid').classList.remove('single');
    } else {
        document.getElementById('layout-grid-btn').classList.remove('active');
        document.getElementById('layout-single-btn').classList.add('active');
        document.getElementById('camera-grid').classList.add('single');
    }
    
    updateCameraGrid();
}

// Open a detection panel
function openDetectionPanel(panelType) {
    // Hide all panels first
    document.querySelectorAll('.search-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Show the selected panel
    let panelTitle = '';
    let panelId = '';

    switch (panelType) {
        case 'person-search':
            panelTitle = 'Person Search';
            panelId = 'person-search-panel';
            break;
        case 'vehicle-search':
            panelTitle = 'Vehicle Search';
            panelId = 'vehicle-search-panel';
            break;
        case 'incident-detection':
            panelTitle = 'Incident Detection';
            panelId = 'incident-detection-panel';
            break;
        case 'traffic-analysis':
            panelTitle = 'Traffic Analysis';
            panelId = 'traffic-analysis-panel';
            break;
    }

    document.getElementById('detection-panel-title').textContent = panelTitle;

    // Get the panel element
    const panelElement = document.getElementById(panelId);
    panelElement.classList.add('active');

    // Show the detection panel with animation
    const detectionPanel = document.getElementById('detection-panel');
    detectionPanel.classList.add('active');

    // Apply Framer Motion animation if available
    if (window.framerMotionIntegration && window.framerMotion) {
        window.framerMotionIntegration.animateElement(detectionPanel, {
            initial: { opacity: 0, x: 30 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
        });

        // Animate the search panel content
        const formGroups = panelElement.querySelectorAll('.form-group, .upload-area, .license-plate-input, .incident-types, .traffic-options');
        formGroups.forEach((group, index) => {
            window.framerMotionIntegration.animateElement(group, {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.4, delay: 0.1 + (index * 0.1), ease: 'easeOut' }
            });
        });

        // Animate the search button
        const searchBtn = panelElement.querySelector('.search-btn');
        if (searchBtn) {
            window.framerMotionIntegration.animateElement(searchBtn, {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.4, delay: 0.5, ease: 'easeOut' }
            });
        }
    }

    // Update active panel
    liveFinder.activePanel = panelType;

    // Update tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeToolBtn = document.getElementById(`${panelType}-btn`);
    activeToolBtn.classList.add('active');

    // Apply animation to the active tool button
    if (window.framerMotionIntegration) {
        window.framerMotionIntegration.animateElement(activeToolBtn, {
            animate: { scale: 1.05 },
            transition: { duration: 0.3, ease: 'easeOut' }
        });

        setTimeout(() => {
            window.framerMotionIntegration.animateElement(activeToolBtn, {
                animate: { scale: 1 },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
        }, 300);
    }

    // Update camera selects
    updateCameraSelects();

    // Refresh AOS animations
    if (window.AOS) {
        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }
}

// Close the detection panel
function closeDetectionPanel() {
    const detectionPanel = document.getElementById('detection-panel');

    // Apply Framer Motion animation if available
    if (window.framerMotionIntegration && window.framerMotion) {
        window.framerMotionIntegration.animateElement(detectionPanel, {
            animate: { opacity: 0, x: 30 },
            transition: { duration: 0.3, ease: 'easeIn' }
        });

        // Remove the active class after animation completes
        setTimeout(() => {
            detectionPanel.classList.remove('active');
        }, 300);
    } else {
        // Fallback to CSS transition
        detectionPanel.classList.remove('active');
    }

    liveFinder.activePanel = null;

    // Update tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');

        // Apply subtle animation to tool buttons
        if (window.framerMotionIntegration) {
            window.framerMotionIntegration.animateElement(btn, {
                animate: { scale: 0.95 },
                transition: { duration: 0.2, ease: 'easeOut' }
            });

            setTimeout(() => {
                window.framerMotionIntegration.animateElement(btn, {
                    animate: { scale: 1 },
                    transition: { duration: 0.2, ease: 'easeOut' }
                });
            }, 200);
        }
    });
}

// Handle person image upload
function handlePersonImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('person-preview');
        preview.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        preview.appendChild(img);
        
        // Enable the search button
        document.getElementById('start-person-search').disabled = false;
    };
    
    reader.readAsDataURL(file);
}

// Start person search
function startPersonSearch() {
    if (liveFinder.cameras.length === 0) {
        showToast('No cameras available for search', 'error');
        return;
    }
    
    const precision = document.getElementById('person-precision').value;
    const cameraSelect = document.getElementById('person-camera-select').value;
    
    showToast('Starting person search...', 'info');
    
    // Simulate search delay
    setTimeout(() => {
        // For demo purposes, simulate finding the person on a random camera
        if (liveFinder.cameras.length > 0) {
            const randomCamera = liveFinder.cameras[Math.floor(Math.random() * liveFinder.cameras.length)];
            
            // Create a detection box
            createDetectionBox(randomCamera.id, 'person', {
                x: 30 + Math.random() * 40,
                y: 30 + Math.random() * 40,
                width: 15 + Math.random() * 10,
                height: 25 + Math.random() * 15
            });
            
            // Add to results
            addDetectionResult('person', {
                title: 'Person Found',
                camera: randomCamera.name,
                location: randomCamera.location,
                time: getCurrentTime(),
                confidence: Math.floor(70 + Math.random() * 30) + '%',
                thumbnail: 'https://via.placeholder.com/80x60'
            });
            
            // Update active detections
            updateActiveDetections(1);
            
            showToast('Person found on ' + randomCamera.name, 'success');
        }
    }, 2000);
}

// Handle license plate input
function handleLicensePlateInput(e) {
    const input = e.target.value.toUpperCase();
    document.getElementById('license-plate').value = input;
    
    // Enable search button if input is not empty
    document.getElementById('start-vehicle-search').disabled = input.length === 0;
    
    // Show suggestions (demo)
    const suggestions = document.getElementById('plate-suggestions');
    suggestions.innerHTML = '';
    
    if (input.length >= 2) {
        // Demo suggestions
        const demoPlates = ['ABC123', 'XYZ789', 'DEF456', 'GHI789', 'JKL012'];
        const matchingPlates = demoPlates.filter(plate => plate.includes(input));
        
        if (matchingPlates.length > 0) {
            suggestions.style.display = 'block';
            
            matchingPlates.forEach(plate => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = plate;
                item.addEventListener('click', () => {
                    document.getElementById('license-plate').value = plate;
                    suggestions.style.display = 'none';
                    document.getElementById('start-vehicle-search').disabled = false;
                });
                
                suggestions.appendChild(item);
            });
        } else {
            suggestions.style.display = 'none';
        }
    } else {
        suggestions.style.display = 'none';
    }
}

// Start vehicle search
function startVehicleSearch() {
    if (liveFinder.cameras.length === 0) {
        showToast('No cameras available for search', 'error');
        return;
    }
    
    const licensePlate = document.getElementById('license-plate').value;
    const vehicleType = document.getElementById('vehicle-type').value;
    const cameraSelect = document.getElementById('vehicle-camera-select').value;
    
    showToast(`Searching for vehicle with plate ${licensePlate}...`, 'info');
    
    // Simulate search delay
    setTimeout(() => {
        // For demo purposes, simulate finding the vehicle on a random camera
        if (liveFinder.cameras.length > 0) {
            const randomCamera = liveFinder.cameras[Math.floor(Math.random() * liveFinder.cameras.length)];
            
            // Create a detection box
            createDetectionBox(randomCamera.id, 'vehicle', {
                x: 20 + Math.random() * 50,
                y: 40 + Math.random() * 30,
                width: 30 + Math.random() * 20,
                height: 20 + Math.random() * 10
            });
            
            // Add to results
            addDetectionResult('vehicle', {
                title: `Vehicle ${licensePlate}`,
                camera: randomCamera.name,
                location: randomCamera.location,
                time: getCurrentTime(),
                confidence: Math.floor(80 + Math.random() * 20) + '%',
                thumbnail: 'https://via.placeholder.com/80x60'
            });
            
            // Update active detections
            updateActiveDetections(1);
            
            showToast(`Vehicle ${licensePlate} found on ${randomCamera.name}`, 'success');
        }
    }, 2000);
}

// Global variable to track if incident detection is running
let incidentDetectionActive = false;
let incidentDetectionInterval = null;
let selectedIncidentTypes = [];
let selectedAlertMethod = 'visual';
let selectedIncidentCameras = 'all';

// Start incident detection
function startIncidentDetection() {
    if (liveFinder.cameras.length === 0) {
        showToast('No cameras available for monitoring', 'error');
        return;
    }

    // If incident detection is already running, stop it
    if (incidentDetectionActive) {
        stopIncidentDetection();
        return;
    }

    selectedAlertMethod = document.getElementById('alert-method').value;
    selectedIncidentCameras = document.getElementById('incident-camera-select').value;

    // Get selected incident types
    selectedIncidentTypes = [];
    document.querySelectorAll('#incident-detection-panel input[type="checkbox"]:checked').forEach(checkbox => {
        selectedIncidentTypes.push(checkbox.value);
    });

    if (selectedIncidentTypes.length === 0) {
        showToast('Please select at least one incident type', 'error');
        return;
    }

    // Update button text to show active state
    const startButton = document.getElementById('start-incident-detection');
    startButton.innerHTML = '<i class="fas fa-stop"></i> Stop Monitoring';
    startButton.classList.add('active');

    // Set the flag to indicate incident detection is active
    incidentDetectionActive = true;

    showToast('Live incident detection started', 'success');

    // Add a status indicator to the control panel
    addStatusIndicator('incident-detection', 'Incident Detection Active');

    // Run the first detection immediately
    runIncidentDetection();

    // Set up interval for continuous detection (every 5-15 seconds)
    incidentDetectionInterval = setInterval(runIncidentDetection, getRandomInterval(5000, 15000));
}

// Stop incident detection
function stopIncidentDetection() {
    // Clear the interval
    if (incidentDetectionInterval) {
        clearInterval(incidentDetectionInterval);
        incidentDetectionInterval = null;
    }

    // Update button text to show inactive state
    const startButton = document.getElementById('start-incident-detection');
    startButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Start Monitoring';
    startButton.classList.remove('active');

    // Set the flag to indicate incident detection is inactive
    incidentDetectionActive = false;

    // Remove the status indicator
    removeStatusIndicator('incident-detection');

    showToast('Incident detection stopped', 'info');
}

// Run a single incident detection cycle
function runIncidentDetection() {
    console.log('Running incident detection cycle...');

    // Only proceed if incident detection is active
    if (!incidentDetectionActive) return;

    // Get cameras to monitor (all or selected)
    let camerasToMonitor = liveFinder.cameras;
    if (selectedIncidentCameras !== 'all') {
        camerasToMonitor = liveFinder.cameras.filter(camera => camera.id === selectedIncidentCameras);
    }

    if (camerasToMonitor.length === 0) {
        console.log('No cameras to monitor');
        return;
    }

    // Randomly decide if an incident is detected (30% chance)
    if (Math.random() > 0.7) {
        // Select a random camera
        const randomCamera = camerasToMonitor[Math.floor(Math.random() * camerasToMonitor.length)];

        // Select a random incident type from the selected types
        const randomIncidentType = selectedIncidentTypes[Math.floor(Math.random() * selectedIncidentTypes.length)];

        let incidentTitle = '';
        switch (randomIncidentType) {
            case 'accident':
                incidentTitle = 'Traffic Accident';
                break;
            case 'fire':
                incidentTitle = 'Fire Detected';
                break;
            case 'violence':
                incidentTitle = 'Fight/Violence';
                break;
            case 'collapse':
                incidentTitle = 'Structure Collapse';
                break;
            case 'crowd':
                incidentTitle = 'Unusual Crowd';
                break;
        }

        console.log(`Incident detected: ${incidentTitle} on ${randomCamera.name}`);

        // Create a detection box
        createDetectionBox(randomCamera.id, 'incident', {
            x: 10 + Math.random() * 60,
            y: 10 + Math.random() * 60,
            width: 30 + Math.random() * 30,
            height: 20 + Math.random() * 30
        });

        // Add to results
        addDetectionResult('incident', {
            title: incidentTitle,
            camera: randomCamera.name,
            location: randomCamera.location,
            time: getCurrentTime(),
            confidence: Math.floor(85 + Math.random() * 15) + '%',
            thumbnail: 'https://via.placeholder.com/80x60'
        });

        // Update active detections and incidents
        updateActiveDetections(1);
        updateIncidentsToday(1);

        // Show alert based on selected method
        if (selectedAlertMethod === 'visual' || selectedAlertMethod === 'all') {
            showIncidentAlert(incidentTitle, randomCamera.name, randomCamera.location);
        }

        if (selectedAlertMethod === 'sound' || selectedAlertMethod === 'all') {
            playAlertSound();
        }

        if (selectedAlertMethod === 'email' || selectedAlertMethod === 'all') {
            // Simulate sending email
            showToast(`Alert email sent to security team about ${incidentTitle}`, 'info');
        }
    } else {
        console.log('No incidents detected in this cycle');
    }
}

// Helper function to get a random interval between min and max
function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add a status indicator to the control panel
function addStatusIndicator(id, text) {
    // Check if the indicator already exists
    if (document.getElementById(`status-${id}`)) {
        return;
    }

    const statusContainer = document.createElement('div');
    statusContainer.id = `status-${id}`;
    statusContainer.className = 'live-status-indicator';
    statusContainer.innerHTML = `
        <i class="fas fa-circle pulse"></i>
        <span>${text}</span>
    `;

    // Add to the status indicators section
    const statusIndicators = document.querySelector('.status-indicators');
    if (statusIndicators) {
        statusIndicators.appendChild(statusContainer);
    }
}

// Remove a status indicator
function removeStatusIndicator(id) {
    const indicator = document.getElementById(`status-${id}`);
    if (indicator) {
        indicator.remove();
    }
}

// Global variables for traffic analysis
let trafficAnalysisActive = false;
let trafficAnalysisInterval = null;
let selectedTrafficFrequency = 30; // Default: 30 seconds
let selectedTrafficDisplayMode = 'both';
let selectedTrafficCameras = 'all';

// Start traffic analysis
function startTrafficAnalysis() {
    if (liveFinder.cameras.length === 0) {
        showToast('No cameras available for analysis', 'error');
        return;
    }

    // If traffic analysis is already running, stop it
    if (trafficAnalysisActive) {
        stopTrafficAnalysis();
        return;
    }

    // Get user selections
    selectedTrafficFrequency = parseInt(document.getElementById('traffic-frequency').value);
    selectedTrafficDisplayMode = document.getElementById('traffic-display').value;
    selectedTrafficCameras = document.getElementById('traffic-camera-select').value;

    // Update button text to show active state
    const startButton = document.getElementById('start-traffic-analysis');
    startButton.innerHTML = '<i class="fas fa-stop"></i> Stop Analysis';
    startButton.classList.add('active');

    // Set the flag to indicate traffic analysis is active
    trafficAnalysisActive = true;

    showToast(`Live traffic analysis started - updating every ${selectedTrafficFrequency} seconds`, 'success');

    // Add a status indicator to the control panel
    addStatusIndicator('traffic-analysis', 'Traffic Analysis Active');

    // Run the first analysis immediately
    runTrafficAnalysis();

    // Set up interval for continuous analysis based on user-selected frequency
    trafficAnalysisInterval = setInterval(runTrafficAnalysis, selectedTrafficFrequency * 1000);

    // If heatmap display is selected, show the heatmap modal
    if (selectedTrafficDisplayMode === 'heatmap' || selectedTrafficDisplayMode === 'both') {
        document.getElementById('traffic-heatmap-modal').classList.add('active');
        updateHeatmap();
    }
}

// Stop traffic analysis
function stopTrafficAnalysis() {
    // Clear the interval
    if (trafficAnalysisInterval) {
        clearInterval(trafficAnalysisInterval);
        trafficAnalysisInterval = null;
    }

    // Update button text to show inactive state
    const startButton = document.getElementById('start-traffic-analysis');
    startButton.innerHTML = '<i class="fas fa-traffic-light"></i> Start Analysis';
    startButton.classList.remove('active');

    // Set the flag to indicate traffic analysis is inactive
    trafficAnalysisActive = false;

    // Remove the status indicator
    removeStatusIndicator('traffic-analysis');

    // Close the heatmap modal if it's open
    document.getElementById('traffic-heatmap-modal').classList.remove('active');

    // Remove traffic indicators from cameras
    liveFinder.cameras.forEach(camera => {
        removeTrafficIndicator(camera.id);
    });

    showToast('Traffic analysis stopped', 'info');
}

// Run a single traffic analysis cycle
function runTrafficAnalysis() {
    console.log('Running traffic analysis cycle...');

    // Only proceed if traffic analysis is active
    if (!trafficAnalysisActive) return;

    // Get cameras to analyze (all or selected)
    let camerasToAnalyze = liveFinder.cameras;
    if (selectedTrafficCameras !== 'all') {
        camerasToAnalyze = liveFinder.cameras.filter(camera => camera.id === selectedTrafficCameras);
    }

    if (camerasToAnalyze.length === 0) {
        console.log('No cameras to analyze');
        return;
    }

    // Clear previous traffic indicators
    liveFinder.cameras.forEach(camera => {
        removeTrafficIndicator(camera.id);
    });

    // For each camera, analyze traffic
    camerasToAnalyze.forEach(camera => {
        // Randomly assign traffic levels with some time-based variation
        // This creates a more realistic pattern where traffic changes over time
        const hour = new Date().getHours();
        let trafficLevels = ['low', 'medium', 'high'];

        // Bias traffic levels based on time of day (rush hours, etc.)
        let weights;
        if (hour >= 7 && hour <= 9) {
            // Morning rush hour: higher chance of high traffic
            weights = [0.1, 0.3, 0.6];
        } else if (hour >= 16 && hour <= 18) {
            // Evening rush hour: higher chance of high traffic
            weights = [0.1, 0.3, 0.6];
        } else if (hour >= 22 || hour <= 5) {
            // Night: higher chance of low traffic
            weights = [0.7, 0.2, 0.1];
        } else {
            // Normal daytime: balanced distribution
            weights = [0.3, 0.4, 0.3];
        }

        // Select traffic level based on weights
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let randomLevel;

        for (let i = 0; i < weights.length; i++) {
            cumulativeWeight += weights[i];
            if (randomValue <= cumulativeWeight) {
                randomLevel = trafficLevels[i];
                break;
            }
        }

        // Add traffic indicator
        addTrafficIndicator(camera.id, randomLevel);

        // Calculate vehicle count based on traffic level
        const vehicleCount = randomLevel === 'low' ? Math.floor(Math.random() * 10) + 1 :
                            randomLevel === 'medium' ? Math.floor(Math.random() * 20) + 11 :
                            Math.floor(Math.random() * 30) + 31;

        // Add to results
        addDetectionResult('traffic', {
            title: `${randomLevel.charAt(0).toUpperCase() + randomLevel.slice(1)} Traffic`,
            camera: camera.name,
            location: camera.location,
            time: getCurrentTime(),
            details: `${vehicleCount} vehicles detected`,
            thumbnail: 'https://via.placeholder.com/80x60'
        });

        console.log(`Traffic analysis for ${camera.name}: ${randomLevel} (${vehicleCount} vehicles)`);
    });

    // Update the heatmap if it's visible
    if ((selectedTrafficDisplayMode === 'heatmap' || selectedTrafficDisplayMode === 'both') &&
        document.getElementById('traffic-heatmap-modal').classList.contains('active')) {
        updateHeatmap();
    }

    // Update the traffic chart if it's visible
    if (selectedTrafficDisplayMode === 'chart' || selectedTrafficDisplayMode === 'both') {
        updateTrafficChart();
    }
}

// Remove traffic indicator from a camera
function removeTrafficIndicator(cameraId) {
    const cameraCell = document.querySelector(`.camera-cell[data-id="${cameraId}"]`);
    if (!cameraCell) return;

    const indicator = cameraCell.querySelector('.traffic-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Create a detection box on a camera
function createDetectionBox(cameraId, type, position) {
    const cameraCell = document.querySelector(`.camera-cell[data-id="${cameraId}"]`);
    if (!cameraCell) return;
    
    const box = document.createElement('div');
    box.className = `detection-box ${type}`;
    box.style.left = `${position.x}%`;
    box.style.top = `${position.y}%`;
    box.style.width = `${position.width}%`;
    box.style.height = `${position.height}%`;
    
    const label = document.createElement('div');
    label.className = `detection-label ${type}`;
    
    switch (type) {
        case 'person':
            label.textContent = 'Person';
            break;
        case 'vehicle':
            label.textContent = 'Vehicle';
            break;
        case 'incident':
            label.textContent = 'Incident';
            break;
    }
    
    box.appendChild(label);
    cameraCell.appendChild(box);
    
    // Remove after some time
    setTimeout(() => {
        if (box.parentNode) {
            box.parentNode.removeChild(box);
            updateActiveDetections(-1);
        }
    }, 30000);
}

// Add traffic indicator to a camera
function addTrafficIndicator(cameraId, level) {
    const cameraCell = document.querySelector(`.camera-cell[data-id="${cameraId}"]`);
    if (!cameraCell) return;
    
    // Remove existing indicator if any
    const existingIndicator = cameraCell.querySelector('.traffic-overlay');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'traffic-overlay';
    
    const dot = document.createElement('span');
    dot.className = `traffic-indicator ${level}`;
    
    const text = document.createElement('span');
    text.textContent = `${level.charAt(0).toUpperCase() + level.slice(1)} Traffic`;
    
    indicator.appendChild(dot);
    indicator.appendChild(text);
    cameraCell.appendChild(indicator);
}

// Add a detection result to the results panel
function addDetectionResult(type, data) {
    const resultsList = document.getElementById('results-list');
    
    // Remove empty state if present
    const emptyState = resultsList.querySelector('.empty-results');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Create result item
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.dataset.type = type;
    
    // Create thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'result-thumbnail';
    
    const img = document.createElement('img');
    img.src = data.thumbnail;
    img.alt = data.title;
    
    thumbnail.appendChild(img);
    
    // Create info
    const info = document.createElement('div');
    info.className = 'result-info';
    
    const title = document.createElement('div');
    title.className = 'result-title';
    title.textContent = data.title;
    
    const details = document.createElement('div');
    details.className = 'result-details';
    
    // Camera detail
    const cameraDetail = document.createElement('div');
    cameraDetail.className = 'result-detail';
    
    const cameraIcon = document.createElement('i');
    cameraIcon.className = 'fas fa-video';
    
    const cameraText = document.createElement('span');
    cameraText.textContent = data.camera;
    
    cameraDetail.appendChild(cameraIcon);
    cameraDetail.appendChild(cameraText);
    
    // Location detail
    const locationDetail = document.createElement('div');
    locationDetail.className = 'result-detail';
    
    const locationIcon = document.createElement('i');
    locationIcon.className = 'fas fa-map-marker-alt';
    
    const locationText = document.createElement('span');
    locationText.textContent = data.location;
    
    locationDetail.appendChild(locationIcon);
    locationDetail.appendChild(locationText);
    
    // Time detail
    const timeDetail = document.createElement('div');
    timeDetail.className = 'result-detail';
    
    const timeIcon = document.createElement('i');
    timeIcon.className = 'fas fa-clock';
    
    const timeText = document.createElement('span');
    timeText.textContent = data.time;
    
    timeDetail.appendChild(timeIcon);
    timeDetail.appendChild(timeText);
    
    // Confidence detail (if available)
    if (data.confidence) {
        const confidenceDetail = document.createElement('div');
        confidenceDetail.className = 'result-detail';
        
        const confidenceIcon = document.createElement('i');
        confidenceIcon.className = 'fas fa-check-circle';
        
        const confidenceText = document.createElement('span');
        confidenceText.textContent = data.confidence;
        
        confidenceDetail.appendChild(confidenceIcon);
        confidenceDetail.appendChild(confidenceText);
        
        details.appendChild(confidenceDetail);
    }
    
    // Additional details (if available)
    if (data.details) {
        const additionalDetail = document.createElement('div');
        additionalDetail.className = 'result-detail';
        
        const additionalIcon = document.createElement('i');
        additionalIcon.className = 'fas fa-info-circle';
        
        const additionalText = document.createElement('span');
        additionalText.textContent = data.details;
        
        additionalDetail.appendChild(additionalIcon);
        additionalDetail.appendChild(additionalText);
        
        details.appendChild(additionalDetail);
    }
    
    details.appendChild(cameraDetail);
    details.appendChild(locationDetail);
    details.appendChild(timeDetail);
    
    info.appendChild(title);
    info.appendChild(details);
    
    // Create actions
    const actions = document.createElement('div');
    actions.className = 'result-actions';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'result-action-btn';
    viewBtn.title = 'View';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.addEventListener('click', () => viewDetectionResult(type, data));
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'result-action-btn';
    saveBtn.title = 'Save';
    saveBtn.innerHTML = '<i class="fas fa-save"></i>';
    saveBtn.addEventListener('click', () => saveDetectionResult(type, data));
    
    actions.appendChild(viewBtn);
    actions.appendChild(saveBtn);
    
    // Assemble result item
    resultItem.appendChild(thumbnail);
    resultItem.appendChild(info);
    resultItem.appendChild(actions);
    
    // Add to results list
    resultsList.prepend(resultItem);
    
    // Store in detection results
    liveFinder.detectionResults.push({
        type,
        ...data
    });
}

// View a detection result
function viewDetectionResult(type, data) {
    // Find the camera
    const camera = liveFinder.cameras.find(cam => cam.name === data.camera);
    if (!camera) return;
    
    // Switch to single layout and focus on the camera
    setLayout('single');
    
    // Highlight the camera
    const cameraCell = document.querySelector(`.camera-cell[data-id="${camera.id}"]`);
    if (cameraCell) {
        cameraCell.scrollIntoView({ behavior: 'smooth' });
        
        // Add highlight effect
        cameraCell.classList.add('highlight');
        setTimeout(() => {
            cameraCell.classList.remove('highlight');
        }, 2000);
    }
}

// Save a detection result
function saveDetectionResult(type, data) {
    showToast('Detection result saved to reports', 'success');
}

// Toggle the results panel
function toggleResultsPanel() {
    const resultsPanel = document.querySelector('.results-panel');
    resultsPanel.classList.toggle('minimized');
    
    const icon = document.querySelector('.minimize-panel-btn i');
    if (resultsPanel.classList.contains('minimized')) {
        icon.className = 'fas fa-chevron-up';
    } else {
        icon.className = 'fas fa-chevron-down';
    }
}

// Switch results tab
function switchResultsTab(tab) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    
    // Filter results
    const resultItems = document.querySelectorAll('.result-item');
    
    if (tab === 'all') {
        resultItems.forEach(item => {
            item.style.display = 'flex';
        });
    } else {
        resultItems.forEach(item => {
            if (item.dataset.type === tab) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Export results
function exportResults() {
    showToast('Exporting results to PDF...', 'info');
    
    // Simulate export delay
    setTimeout(() => {
        showToast('Results exported successfully', 'success');
    }, 1500);
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Select a demo stream
function selectDemoStream(streamId) {
    const stream = liveFinder.demoStreams[streamId];
    if (!stream) return;
    
    document.getElementById('camera-name').value = stream.name;
    document.getElementById('camera-location').value = stream.location;
    document.getElementById('camera-url').value = stream.url;
}

// Test camera connection
function testCameraConnection() {
    const url = document.getElementById('camera-url').value;
    
    if (!url) {
        showToast('Please enter a camera URL', 'error');
        return;
    }
    
    showToast('Testing connection...', 'info');
    
    // Simulate connection test
    setTimeout(() => {
        showToast('Connection successful', 'success');
    }, 1500);
}

// Save camera
function saveCamera() {
    const name = document.getElementById('camera-name').value;
    const location = document.getElementById('camera-location').value;
    const url = document.getElementById('camera-url').value;

    if (!name || !location || !url) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Use the global liveFinder object if available
    const cameras = window.liveFinder ? window.liveFinder.cameras : liveFinder.cameras;
    const maxCameras = window.liveFinder ? window.liveFinder.maxCameras : 10;

    if (cameras.length >= maxCameras) {
        showToast(`Maximum of ${maxCameras} cameras allowed`, 'error');
        return;
    }

    // Create a new camera
    const camera = {
        id: 'camera-' + Date.now(),
        name,
        location,
        url
    };

    // Set a flag to skip loading sample cameras
    window.skipSampleCameras = true;

    // Clear all existing cameras to ensure only this camera is displayed
    console.log('Clearing existing cameras to show only the newly added camera');
    if (window.liveFinder) {
        window.liveFinder.cameras = [];
        window.liveFinder.cameras.push(camera);
    } else {
        liveFinder.cameras = [];
        liveFinder.cameras.push(camera);
    }

    // Update camera grid
    updateCameraGrid();

    // Update camera count
    document.getElementById('active-cameras').textContent = cameras.length;

    // Close modal
    closeAllModals();

    // Reset form
    document.getElementById('camera-name').value = '';
    document.getElementById('camera-location').value = '';
    document.getElementById('camera-url').value = '';

    showToast('Camera added successfully', 'success');
}

// Show incident alert
function showIncidentAlert(type, camera, location) {
    // Set alert modal content
    document.getElementById('alert-title').textContent = type;
    document.getElementById('alert-type').textContent = type;
    document.getElementById('alert-camera').textContent = camera;
    document.getElementById('alert-location').textContent = location;
    document.getElementById('alert-time').textContent = getCurrentTime();
    document.getElementById('alert-confidence').textContent = Math.floor(90 + Math.random() * 10) + '%';
    document.getElementById('alert-image').src = 'https://via.placeholder.com/200x150';
    
    // Show alert modal
    document.getElementById('detection-alert-modal').classList.add('active');
    
    // Show floating alert
    document.getElementById('floating-alert-title').textContent = type;
    document.getElementById('floating-alert-message').textContent = `Detected on ${camera} at ${location}`;
    document.getElementById('floating-alert').classList.add('active');
    
    // Play alert sound (if enabled)
    playAlertSound();
}

// Dismiss alert
function dismissAlert() {
    closeAllModals();
    closeFloatingAlert();
}

// View alert camera
function viewAlertCamera() {
    const camera = document.getElementById('alert-camera').textContent;
    const cameraObj = liveFinder.cameras.find(cam => cam.name === camera);
    
    if (cameraObj) {
        // Switch to single layout
        setLayout('single');
        
        // Focus on the camera
        const cameraCell = document.querySelector(`.camera-cell[data-id="${cameraObj.id}"]`);
        if (cameraCell) {
            cameraCell.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    closeAllModals();
}

// Report emergency
function reportEmergency() {
    showToast('Emergency reported to authorities', 'success');
    closeAllModals();
}

// Close floating alert
function closeFloatingAlert() {
    document.getElementById('floating-alert').classList.remove('active');
}

// Play alert sound
function playAlertSound() {
    // Create audio element
    const audio = new Audio('https://assets.alert-x.com/sounds/alert.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => {
        console.log('Audio play failed:', e);
    });
}

// Switch heatmap time
function switchHeatmapTime(time) {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`.time-btn[data-time="${time}"]`).classList.add('active');
    
    updateHeatmap();
}

// Switch heatmap view
function switchHeatmapView(view) {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`.view-btn[data-view="${view}"]`).classList.add('active');
    
    if (view === 'heatmap') {
        document.querySelector('.heatmap-view').style.display = 'block';
        document.querySelector('.chart-view').style.display = 'none';
    } else {
        document.querySelector('.heatmap-view').style.display = 'none';
        document.querySelector('.chart-view').style.display = 'block';
        updateTrafficChart();
    }
}

// Update camera grid
function updateCameraGrid() {
    console.log('Updating camera grid with cameras:', liveFinder.cameras);

    // Make sure we're using the global liveFinder object
    const cameras = window.liveFinder ? window.liveFinder.cameras : liveFinder.cameras;
    console.log('Using cameras from:', window.liveFinder ? 'window.liveFinder' : 'local liveFinder');

    const cameraGrid = document.getElementById('camera-grid');

    // Clear grid
    cameraGrid.innerHTML = '';

    if (!cameras || cameras.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-video-slash"></i>
            <h3>No Cameras Connected</h3>
            <p>Click "Add Camera" to connect your CCTV feeds</p>
        `;

        cameraGrid.appendChild(emptyState);
        return;
    }

    // Add camera cells
    cameras.forEach(camera => {
        console.log('Adding camera to grid:', camera);
        const cameraCell = document.createElement('div');
        cameraCell.className = 'camera-cell';
        cameraCell.dataset.id = camera.id;

        // Handle different camera types
        if (camera.type === 'webcam' && camera.stream) {
            console.log('Creating webcam video element for camera:', camera.id, camera.name);
            console.log('Webcam stream tracks:', camera.stream.getTracks());

            // Create video element for webcam
            const video = document.createElement('video');
            video.className = 'camera-video webcam-video'; // Add special class for webcams
            video.autoplay = true;
            video.muted = true;
            video.playsinline = true;
            video.controls = false; // No controls needed

            // Add CSS to ensure video is visible
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.backgroundColor = '#000'; // Black background

            // Add a special attribute to identify this as a webcam video
            video.setAttribute('data-webcam', 'true');

            // Add the video element to the DOM first (important for iOS)
            cameraCell.appendChild(video);

            // Ensure the stream is active
            const videoTracks = camera.stream.getVideoTracks();
            if (videoTracks.length > 0) {
                console.log('Webcam track state:', videoTracks[0].readyState);
                console.log('Webcam track settings:', videoTracks[0].getSettings());

                // Make sure the track is enabled
                videoTracks[0].enabled = true;

                // Always try to use the stream, even if readyState isn't 'live' yet
                console.log('Attaching webcam stream to video element');

                try {
                    // Try to attach the stream to the video element
                    video.srcObject = camera.stream;

                    // Add event listeners for debugging
                    video.addEventListener('loadedmetadata', () => {
                        console.log('Webcam video loadedmetadata event fired');
                    });

                    video.addEventListener('playing', () => {
                        console.log('Webcam video playing event fired');
                        // Add a success class when playing starts
                        video.classList.add('playing');
                        cameraCell.classList.add('webcam-active');
                    });

                    video.addEventListener('play', () => {
                        console.log('Webcam video started playing:', camera.name);
                    });

                    video.addEventListener('error', (e) => {
                        console.error('Webcam video error:', e);
                    });

                    // Then try to play it
                    console.log('Attempting to play webcam video');
                    video.play()
                        .then(() => {
                            console.log('Webcam video playback started successfully');

                            // Add a status indicator to show the webcam is active
                            const statusIndicator = document.createElement('div');
                            statusIndicator.className = 'camera-status webcam-status';
                            statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Live';
                            cameraCell.appendChild(statusIndicator);
                        })
                        .catch(e => {
                            console.error('Error playing webcam video:', e);
                            // Try to recover by creating a placeholder
                            video.poster = `https://picsum.photos/seed/${camera.id}/800/450`;

                            // Try again with a delay (sometimes helps on mobile)
                            setTimeout(() => {
                                console.log('Retrying webcam playback after delay');
                                video.play().catch(err => {
                                    console.error('Second attempt to play webcam failed:', err);
                                });
                            }, 1000);
                        });
                } catch (err) {
                    console.error('Error setting srcObject on video element:', err);
                    // Use placeholder if setting srcObject fails
                    video.poster = `https://picsum.photos/seed/${camera.id}/800/450`;
                }
            } else {
                console.error('No video tracks available in webcam stream');
                // Use placeholder if no tracks available
                video.poster = `https://picsum.photos/seed/${camera.id}/800/450`;
            }

            // Add a special indicator for webcam cells
            const webcamIndicator = document.createElement('div');
            webcamIndicator.className = 'webcam-indicator';
            webcamIndicator.innerHTML = '<i class="fas fa-video"></i>';
            cameraCell.appendChild(webcamIndicator);
        } else {
            // For demo cameras or if webcam stream is not available
            console.log('Creating placeholder for camera:', camera.id, camera.name);
            const video = document.createElement('video');
            video.className = 'camera-video';
            video.autoplay = true;
            video.muted = true;
            video.loop = true;

            // For demo purposes, use a placeholder image
            video.poster = `https://picsum.photos/seed/${camera.id}/800/450`;

            cameraCell.appendChild(video);
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'camera-overlay';

        const info = document.createElement('div');
        info.className = 'camera-info';

        const nameLocation = document.createElement('div');

        const name = document.createElement('span');
        name.className = 'camera-name';
        name.textContent = camera.name;

        const location = document.createElement('span');
        location.className = 'camera-location';
        location.textContent = camera.location;

        nameLocation.appendChild(name);
        nameLocation.appendChild(document.createTextNode(' • '));
        nameLocation.appendChild(location);

        const controls = document.createElement('div');
        controls.className = 'camera-controls-overlay';

        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'camera-control-btn';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullscreen(camera.id);
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'camera-control-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeCamera(camera.id);
        });

        controls.appendChild(fullscreenBtn);
        controls.appendChild(removeBtn);

        info.appendChild(nameLocation);
        info.appendChild(controls);

        overlay.appendChild(info);

        // Create status indicator
        const status = document.createElement('div');

        // Different status for webcam vs. other cameras
        if (camera.type === 'webcam') {
            status.className = 'camera-status recording';
            status.innerHTML = '<i class="fas fa-circle"></i> Webcam';
        } else {
            status.className = 'camera-status recording';
            status.innerHTML = '<i class="fas fa-circle"></i> Live';
        }

        // Assemble camera cell
        cameraCell.appendChild(overlay);
        cameraCell.appendChild(status);

        // Add click event to focus on camera
        cameraCell.addEventListener('click', () => {
            if (liveFinder.layout === 'grid') {
                setLayout('single');
            }
        });

        // Apply Framer Motion animation if available
        if (window.framerMotionIntegration && window.framerMotion) {
            window.framerMotionIntegration.animateElement(cameraCell, {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] }
            });
        }

        cameraGrid.appendChild(cameraCell);
    });
}

// Toggle fullscreen for a camera
function toggleFullscreen(cameraId) {
    const cameraCell = document.querySelector(`.camera-cell[data-id="${cameraId}"]`);
    if (!cameraCell) return;
    
    if (!document.fullscreenElement) {
        cameraCell.requestFullscreen().catch(err => {
            showToast('Error attempting to enable fullscreen mode: ' + err.message, 'error');
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Remove a camera from the grid
function removeCamera(cameraId) {
    console.log('Removing camera:', cameraId);

    // Find the camera in the array
    const cameraIndex = liveFinder.cameras.findIndex(camera => camera.id === cameraId);

    if (cameraIndex === -1) {
        console.error('Camera not found:', cameraId);
        return;
    }

    // Get the camera name for the toast message
    const cameraName = liveFinder.cameras[cameraIndex].name;

    // If it's a webcam, stop the stream
    if (liveFinder.cameras[cameraIndex].type === 'webcam' && liveFinder.cameras[cameraIndex].stream) {
        const stream = liveFinder.cameras[cameraIndex].stream;
        stream.getTracks().forEach(track => track.stop());
    }

    // Remove the camera from the array
    liveFinder.cameras.splice(cameraIndex, 1);

    // Update the grid (don't load sample cameras to maintain the "show only added camera" behavior)
    updateCameraGrid();

    // Update camera count
    document.getElementById('active-cameras').textContent = liveFinder.cameras.length;

    // Show toast message
    showToast(`${cameraName} removed`, 'info');
}

// Open camera settings
function openCameraSettings(cameraId) {
    const camera = liveFinder.cameras.find(cam => cam.id === cameraId);
    if (!camera) return;

    showToast(`Opening settings for ${camera.name}...`, 'info');
}

// Update camera selects
function updateCameraSelects() {
    const selects = [
        document.getElementById('person-camera-select'),
        document.getElementById('vehicle-camera-select'),
        document.getElementById('incident-camera-select'),
        document.getElementById('traffic-camera-select')
    ];
    
    selects.forEach(select => {
        // Clear options except "All Cameras"
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add camera options
        liveFinder.cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.id;
            option.textContent = camera.name;
            select.appendChild(option);
        });
    });
}

// Update active detections count
function updateActiveDetections(change) {
    liveFinder.activeDetections += change;
    if (liveFinder.activeDetections < 0) liveFinder.activeDetections = 0;
    
    document.getElementById('active-detections').textContent = liveFinder.activeDetections;
}

// Update incidents today count
function updateIncidentsToday(change) {
    liveFinder.incidentsToday += change;
    document.getElementById('incidents-today').textContent = liveFinder.incidentsToday;
}

// Initialize results panel
function initResultsPanel() {
    const resultsList = document.getElementById('results-list');
    
    // Add empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-results';
    emptyState.innerHTML = `
        <i class="fas fa-search"></i>
        <p>No detection results yet</p>
    `;
    
    resultsList.appendChild(emptyState);
}

// Set up traffic chart
function setupTrafficChart() {
    const ctx = document.getElementById('traffic-chart');
    if (!ctx) return;
    
    const trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Vehicle Count',
                data: Array.from({length: 24}, () => Math.floor(Math.random() * 50)),
                borderColor: 'rgb(var(--primary-color-rgb))',
                backgroundColor: 'rgba(var(--primary-color-rgb), 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Vehicle Count'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
    
    return trafficChart;
}

// Update traffic chart
function updateTrafficChart() {
    const trafficChart = Chart.getChart('traffic-chart');
    if (!trafficChart) return;
    
    // Update with new random data
    trafficChart.data.datasets[0].data = Array.from({length: 24}, () => Math.floor(Math.random() * 50));
    trafficChart.update();
}

// Set up heatmap
function setupHeatmap() {
    const heatmapContainer = document.getElementById('traffic-heatmap');
    if (!heatmapContainer) return;
    
    // Create heatmap instance
    const heatmapInstance = h337.create({
        container: heatmapContainer,
        radius: 30,
        maxOpacity: 0.8,
        minOpacity: 0.1,
        blur: 0.75,
        gradient: {
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }
    });
    
    // Store heatmap instance
    liveFinder.heatmapInstance = heatmapInstance;
    
    // Initial update
    updateHeatmap();
}

// Update heatmap
function updateHeatmap() {
    if (!liveFinder.heatmapInstance) return;
    
    const width = document.getElementById('traffic-heatmap').offsetWidth;
    const height = document.getElementById('traffic-heatmap').offsetHeight;
    
    // Generate random data points
    const points = [];
    const max = 100;
    
    for (let i = 0; i < 100; i++) {
        const point = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            value: Math.floor(Math.random() * 100)
        };
        points.push(point);
    }
    
    // Set data
    liveFinder.heatmapInstance.setData({
        max,
        data: points
    });
}

// Load sample cameras for demo
function loadSampleCameras() {
    // Make sure cameras array exists
    if (!liveFinder.cameras) {
        liveFinder.cameras = [];
    }

    // Only load sample cameras if no cameras are present
    if (liveFinder.cameras.length > 0) {
        console.log('Cameras already exist, not loading sample cameras');
        return;
    }

    console.log('No cameras found, loading sample cameras');

    // Add some sample cameras
    const sampleCameras = [
        {
            id: 'camera-1',
            name: 'Front Entrance',
            location: 'Main Building',
            url: 'https://demo-streams.alert-x.com/front-entrance.mp4',
            type: 'sample' // Mark as sample camera
        },
        {
            id: 'camera-2',
            name: 'Parking Lot',
            location: 'North Side',
            url: 'https://demo-streams.alert-x.com/parking-lot.mp4',
            type: 'sample'
        },
        {
            id: 'camera-3',
            name: 'Street Corner',
            location: 'Main Street',
            url: 'https://demo-streams.alert-x.com/street-corner.mp4',
            type: 'sample'
        },
        {
            id: 'camera-4',
            name: 'Back Alley',
            location: 'Warehouse District',
            url: 'https://demo-streams.alert-x.com/back-alley.mp4',
            type: 'sample'
        }
    ];

    // Only show one sample camera at a time to match the behavior of user-added cameras
    liveFinder.cameras = [sampleCameras[0]];

    // Update camera grid
    updateCameraGrid();

    // Update camera count
    document.getElementById('active-cameras').textContent = liveFinder.cameras.length;

    // Update camera selects
    updateCameraSelects();
}

// Helper function to get current time
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Show toast notification
function showToast(message, type = 'info') {
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
}

// Remove camera from the grid
function removeCamera(cameraId) {
    // Find the camera in the array
    const cameraIndex = liveFinder.cameras.findIndex(camera => camera.id === cameraId);

    if (cameraIndex === -1) return;

    const camera = liveFinder.cameras[cameraIndex];

    // If it's a webcam, stop the stream
    if (camera.type === 'webcam' && camera.stream) {
        camera.stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    // Remove from the array
    liveFinder.cameras.splice(cameraIndex, 1);

    // Update the grid
    updateCameraGrid();

    // Update camera count
    document.getElementById('active-cameras').textContent = liveFinder.cameras.length;

    // Show toast notification
    showToast('Camera removed', 'info');
}