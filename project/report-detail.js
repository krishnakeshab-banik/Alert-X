// Use the global supabase object
const supabaseUrl = 'https://umnmtmsvdnwbpdoniibo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm10bXN2ZG53YnBkb25paWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQwODMsImV4cCI6MjA1ODg1MDA4M30.CKZTATC52JZWaeI0wIY2qnre0wyvxAEt6n8hNZeePwk';

// This will be initialized when the script loads
let supabase;
let currentUser;
let userMetadata = {};
let reportData = null;
let reportId = null;
let isSaved = false;

// Initialize the report detail page
async function initializeReportDetail() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;
        userMetadata = user.user_metadata || {};
        
        // Update profile information
        updateProfileInfo(user);
        
        // Get report ID from URL
        reportId = getReportIdFromUrl();
        
        if (!reportId) {
            showToast('Invalid report ID', 'error');
            setTimeout(() => {
                window.location.href = 'reports.html';
            }, 2000);
            return;
        }
        
        // Fetch report data
        await fetchReportData(reportId);
        
        // Initialize charts
        initializeCharts();
        
        // Initialize map
        initializeMap();
        
        // Initialize event listeners
        setupEventListeners();
        
        // Initialize animations
        initializeAnimations();
        
    } catch (error) {
        console.error('Error initializing report detail:', error.message);
        showToast(error.message, 'error');
    }
}

// Update profile information
function updateProfileInfo(user) {
    // Update navbar profile
    const profileImage = document.getElementById('profileImage');
    const profileName = document.getElementById('profileName');

    if (user.user_metadata?.avatar_url) {
        profileImage.src = user.user_metadata.avatar_url;
    } else {
        profileImage.src = 'https://via.placeholder.com/32';
    }

    if (user.user_metadata?.username) {
        profileName.textContent = user.user_metadata.username;
    } else {
        profileName.textContent = user.email;
    }
}

// Get report ID from URL
function getReportIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch report data
async function fetchReportData(id) {
    try {
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        reportData = generateMockReportData(id);
        
        // Update the UI with the report data
        updateReportUI(reportData);
        
        // Check if the report is saved
        isSaved = reportData.saved;
        updateSaveButton(isSaved);
    } catch (error) {
        console.error('Error fetching report data:', error);
        showToast('Failed to load report data. Please try again.', 'error');
    }
}

// Generate mock report data
function generateMockReportData(id) {
    // This is a simplified version for demo purposes
    // In a real app, this would be fetched from the database
    
    const types = ['traffic', 'accident', 'fire', 'crowd', 'surveillance'];
    const severities = ['low', 'medium', 'high'];
    
    // Use the ID to determine the type and severity
    const typeIndex = (parseInt(id) % types.length);
    const severityIndex = (parseInt(id) % severities.length);
    
    const type = types[typeIndex];
    const severity = severities[severityIndex];
    
    let title, summary, location, date, metrics, details;
    
    switch (type) {
        case 'accident':
            title = 'Vehicle Collision Detected';
            summary = 'Two-vehicle collision detected at East Sector, Junction 8 at 17:23. The collision appears to involve a sedan and an SUV. Potential injuries detected based on impact severity. Emergency services have been automatically notified. Traffic congestion is building up in the area. Recommend dispatching traffic management personnel to the scene.';
            location = 'East Sector, Junction 8';
            date = new Date('2023-05-14T17:23:00');
            metrics = {
                confidence: '98%',
                vehicles: '2',
                vehicleTypes: 'Sedan, SUV',
                estimatedSpeed: '45 km/h',
                impactSeverity: 'High',
                potentialInjuries: 'Yes'
            };
            details = {
                roadType: 'Intersection',
                trafficConditions: 'Moderate',
                weatherConditions: 'Clear',
                gpsCoordinates: '40.7128° N, 74.0060° W'
            };
            break;
        case 'traffic':
            title = 'Traffic Congestion Analysis';
            summary = 'Heavy traffic congestion detected at North Sector, Highway 42. Approximately 120 vehicles in a 500m stretch. Average speed: 12 km/h. Congestion appears to be caused by a lane closure due to road work. Estimated delay: 15-20 minutes. Recommend using alternative routes via East Sector until congestion clears.';
            location = 'North Sector, Highway 42';
            date = new Date('2023-05-15T08:45:00');
            metrics = {
                confidence: '96%',
                vehicles: '120',
                averageSpeed: '12 km/h',
                congestionLevel: 'High',
                estimatedDelay: '15-20 min',
                congestionCause: 'Road Work'
            };
            details = {
                roadType: 'Highway',
                trafficConditions: 'Heavy',
                weatherConditions: 'Cloudy',
                gpsCoordinates: '40.7228° N, 74.0160° W'
            };
            break;
        case 'fire':
            title = 'Fire Outbreak Detection';
            summary = 'Fire detected in commercial building at West Sector, Building 7. Estimated size: Medium. Smoke visible from multiple cameras. Fire appears to have started on the second floor. No visible human presence in the building. Emergency services have been automatically notified. Recommend evacuation of adjacent buildings as a precaution.';
            location = 'West Sector, Building 7';
            date = new Date('2023-05-13T22:17:00');
            metrics = {
                confidence: '95%',
                fireSize: 'Medium',
                smokeIntensity: 'High',
                spreadRate: 'Moderate',
                buildingType: 'Commercial',
                occupancyDetected: 'No'
            };
            details = {
                buildingFloors: '4',
                nearbyStructures: 'Yes',
                accessRoutes: 'Main Street, Side Alley',
                gpsCoordinates: '40.7028° N, 73.9960° W'
            };
            break;
        case 'crowd':
            title = 'Crowd Altercation Detected';
            summary = 'Physical altercation detected between approximately 7 individuals at Central Area, Plaza. Altercation appears to have started near the fountain area. No weapons detected. Security personnel have been automatically alerted. Recommend immediate security response to prevent escalation.';
            location = 'Central Area, Plaza';
            date = new Date('2023-05-12T23:05:00');
            metrics = {
                confidence: '89%',
                peopleInvolved: '7',
                altercationSeverity: 'Medium',
                weaponsDetected: 'No',
                crowdDensity: 'Moderate',
                spreadPotential: 'High'
            };
            details = {
                areaType: 'Public Plaza',
                nearbyPopulation: '~50 people',
                securityPresence: 'Low',
                gpsCoordinates: '40.7328° N, 74.0060° W'
            };
            break;
        case 'surveillance':
            title = 'Daily Surveillance Summary';
            summary = '24-hour surveillance summary for South Sector, Residential Area. 1,245 vehicles and 3,782 pedestrians detected. No significant incidents detected. Normal activity patterns observed. Weather conditions were clear throughout the monitoring period. Recommend continuing standard surveillance protocols.';
            location = 'South Sector, Residential Area';
            date = new Date('2023-05-11T23:59:00');
            metrics = {
                confidence: '97%',
                vehiclesDetected: '1,245',
                pedestriansDetected: '3,782',
                unusualEvents: '0',
                monitoringPeriod: '24 hours',
                coverageArea: '1.5 km²'
            };
            details = {
                areaType: 'Residential',
                populationDensity: 'Medium',
                securityIncidents: 'None',
                gpsCoordinates: '40.7028° N, 74.0160° W'
            };
            break;
    }
    
    return {
        id: `REP-2023-${id.padStart(5, '0')}`,
        type,
        severity,
        title,
        summary,
        location,
        date,
        source: `Camera ID: CAM-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
        metrics,
        details,
        saved: Math.random() > 0.5, // 50% chance of being saved
        coordinates: {
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
        },
        generated: new Date(date.getTime() + 15000), // 15 seconds after the incident
        updated: new Date(date.getTime() + 1320000) // 22 minutes after the incident
    };
}

// Update the UI with report data
function updateReportUI(data) {
    // Update report title and badges
    document.getElementById('reportTitle').textContent = data.title;
    document.getElementById('reportType').textContent = capitalizeFirstLetter(data.type);
    document.getElementById('reportType').className = `report-type ${data.type}`;
    document.getElementById('reportSeverity').textContent = capitalizeFirstLetter(data.severity);
    document.getElementById('reportSeverity').className = `report-severity ${data.severity}`;
    
    // Update meta information
    document.getElementById('reportLocation').textContent = data.location;
    document.getElementById('reportTime').textContent = formatDate(data.date);
    document.getElementById('reportSource').textContent = data.source;
    
    // Update AI summary
    document.getElementById('aiSummary').textContent = data.summary;
    
    // Update incident details
    if (data.type === 'accident') {
        document.getElementById('incidentType').textContent = 'Vehicle Collision';
        document.getElementById('vehiclesInvolved').textContent = data.metrics.vehicles;
        document.getElementById('vehicleTypes').textContent = data.metrics.vehicleTypes;
        document.getElementById('estimatedSpeed').textContent = data.metrics.estimatedSpeed;
        document.getElementById('impactSeverity').textContent = data.metrics.impactSeverity;
        document.getElementById('potentialInjuries').textContent = data.metrics.potentialInjuries;
    }
    
    // Update location information
    document.getElementById('gpsCoordinates').textContent = data.details.gpsCoordinates;
    document.getElementById('roadType').textContent = data.details.roadType;
    document.getElementById('trafficConditions').textContent = data.details.trafficConditions;
    document.getElementById('weatherConditions').textContent = data.details.weatherConditions;
    
    // Update report information in sidebar
    document.getElementById('reportId').textContent = data.id;
    document.getElementById('reportGenerated').textContent = formatDate(data.generated);
    document.getElementById('reportUpdated').textContent = formatDate(data.updated);
}

// Initialize charts
function initializeCharts() {
    // Detection Chart
    const detectionCtx = document.getElementById('detectionChart').getContext('2d');
    const detectionChart = new Chart(detectionCtx, {
        type: 'line',
        data: {
            labels: ['0s', '5s', '10s', '15s', '20s', '25s', '30s', '35s', '40s'],
            datasets: [
                {
                    label: 'Vehicle Detection',
                    data: [95, 96, 97, 98, 99, 99, 98, 97, 96],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Collision Detection',
                    data: [0, 0, 0, 0, 95, 97, 96, 95, 94],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Injury Probability',
                    data: [0, 0, 0, 0, 65, 75, 72, 70, 68],
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Confidence (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    }
                }
            }
        }
    });
    
    // Historical Chart
    const historicalCtx = document.getElementById('historicalChart').getContext('2d');
    const historicalChart = new Chart(historicalCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Incidents at this location',
                data: [3, 5, 8, 12, 24],
                backgroundColor: 'rgba(100, 108, 255, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Incidents'
                    }
                }
            }
        }
    });
}

// Initialize map
function initializeMap() {
    const mapContainer = document.getElementById('incidentMap');
    if (!mapContainer) return;
    
    // Create the map
    const map = L.map('incidentMap').setView([40.7128, -74.0060], 15);
    
    // Add the tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add marker for the incident
    const marker = L.marker([40.7128, -74.0060]).addTo(map);
    marker.bindPopup(`
        <strong>${reportData.title}</strong><br>
        ${reportData.location}<br>
        ${formatDate(reportData.date)}
    `).openPopup();
    
    // Add circle to show the affected area
    L.circle([40.7128, -74.0060], {
        color: getColorForType(reportData.type),
        fillColor: getColorForType(reportData.type),
        fillOpacity: 0.2,
        radius: 100
    }).addTo(map);
}

// Get color for incident type
function getColorForType(type) {
    switch (type) {
        case 'traffic': return '#3b82f6';
        case 'accident': return '#ef4444';
        case 'fire': return '#f59e0b';
        case 'crowd': return '#8b5cf6';
        case 'surveillance': return '#10b981';
        default: return '#6b7280';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Download report button
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', () => {
            openExportModal();
        });
    }
    
    // Share report button
    const shareReportBtn = document.getElementById('shareReportBtn');
    if (shareReportBtn) {
        shareReportBtn.addEventListener('click', () => {
            openShareModal();
        });
    }
    
    // Save report button
    const saveReportBtn = document.getElementById('saveReportBtn');
    if (saveReportBtn) {
        saveReportBtn.addEventListener('click', () => {
            toggleSavedStatus();
        });
    }
    
    // Video timeline markers
    document.querySelectorAll('.timeline-marker').forEach(marker => {
        marker.addEventListener('click', () => {
            const time = marker.dataset.time;
            const video = document.getElementById('reportVideo');
            if (video) {
                // Parse the time (format: MM:SS)
                const [minutes, seconds] = time.split(':').map(Number);
                video.currentTime = minutes * 60 + seconds;
                video.play();
            }
        });
    });
    
    // Snapshots click to show in video
    document.querySelectorAll('.snapshot').forEach(snapshot => {
        snapshot.addEventListener('click', () => {
            const timeElement = snapshot.querySelector('.snapshot-time');
            if (timeElement) {
                const time = timeElement.textContent;
                const video = document.getElementById('reportVideo');
                if (video) {
                    // Parse the time (format: MM:SS)
                    const [minutes, seconds] = time.split(':').map(Number);
                    video.currentTime = minutes * 60 + seconds;
                    video.play();
                }
            }
        });
    });
    
    // Close modals
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(element => {
        element.addEventListener('click', closeAllModals);
    });
    
    // Copy link in share modal
    const copyLinkBtn = document.querySelector('.copy-link');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const linkInput = document.getElementById('shareLink');
            if (linkInput) {
                linkInput.select();
                document.execCommand('copy');
                showToast('Link copied to clipboard!', 'success');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Open export modal
function openExportModal() {
    const modal = document.getElementById('exportReportModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Open share modal
function openShareModal() {
    const modal = document.getElementById('shareReportModal');
    if (modal) {
        modal.classList.add('active');
        
        // Update the share link
        const shareLink = document.getElementById('shareLink');
        if (shareLink) {
            shareLink.value = `https://alertx.com/reports/${reportData.id}`;
        }
    }
}

// Toggle saved status
function toggleSavedStatus() {
    isSaved = !isSaved;
    
    // Update the button
    updateSaveButton(isSaved);
    
    // Show toast
    showToast(`Report ${isSaved ? 'saved' : 'unsaved'} successfully!`, 'success');
    
    // In a real app, this would update the database
    // For now, we'll just update the local reportData
    reportData.saved = isSaved;
}

// Update save button
function updateSaveButton(saved) {
    const saveReportBtn = document.getElementById('saveReportBtn');
    if (saveReportBtn) {
        const icon = saveReportBtn.querySelector('i') || document.createElement('i');
        icon.className = saved ? 'fas fa-bookmark' : 'far fa-bookmark';
        
        // If the button doesn't have an icon yet, add it
        if (!saveReportBtn.querySelector('i')) {
            saveReportBtn.prepend(icon);
            saveReportBtn.innerHTML = `${icon.outerHTML} ${saved ? 'Saved' : 'Save'}`;
        } else {
            saveReportBtn.innerHTML = `${icon.outerHTML} ${saved ? 'Saved' : 'Save'}`;
        }
    }
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Animate logout
        gsap.to('.report-detail-container', {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                window.location.href = 'index.html';
            }
        });
    } catch (error) {
        console.error('Error signing out:', error.message);
        showToast('Error signing out. Please try again.', 'error');
    }
}

// Initialize animations
function initializeAnimations() {
    // Animate report header
    gsap.from('.report-detail-header-content', {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
    });
    
    // Animate AI summary
    gsap.from('.report-summary-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: "power2.out"
    });
    
    // Animate video section
    gsap.from('.report-media-section', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out"
    });
    
    // Animate details cards
    gsap.from('.detail-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.6,
        ease: "power2.out"
    });
    
    // Animate recommendations
    gsap.from('.recommendation-item', {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.8,
        ease: "power2.out"
    });
    
    // Animate sidebar
    gsap.from('.sidebar-card', {
        x: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.3,
        ease: "power2.out"
    });
}

// Helper Functions

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Toast notification helper
function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
        className: 'toast-notification',
        stopOnFocus: true,
    }).showToast();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase client
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        initializeReportDetail();
    } else {
        console.error('Supabase client not available');
        alert('Error: Authentication service not available. Please try again later.');
    }
});