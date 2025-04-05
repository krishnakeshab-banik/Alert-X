// Use the global supabase object
const supabaseUrl = 'https://umnmtmsvdnwbpdoniibo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm10bXN2ZG53YnBkb25paWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQwODMsImV4cCI6MjA1ODg1MDA4M30.CKZTATC52JZWaeI0wIY2qnre0wyvxAEt6n8hNZeePwk';

// This will be initialized when the script loads
let supabase;
let currentUser;
let userMetadata = {};
let reportsData = [];
let filteredReports = [];
let currentView = 'grid';

// Initialize the reports page
async function initializeReports() {
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

        // Fetch reports data
        await fetchReportsData();

        // Initialize components with proper error handling
        try {
            // Initialize charts
            initializeCharts();
        } catch (chartError) {
            console.error('Error initializing charts:', chartError);
        }

        try {
            // Initialize map
            initializeMap();
        } catch (mapError) {
            console.error('Error initializing map:', mapError);
        }

        try {
            // Initialize event listeners
            setupEventListeners();
        } catch (eventError) {
            console.error('Error setting up event listeners:', eventError);
        }

        try {
            // Initialize animations
            initializeAnimations();
        } catch (animError) {
            console.error('Error initializing animations:', animError);
        }

    } catch (error) {
        console.error('Error initializing reports:', error);
        showToast(error.message || 'An error occurred while loading the reports page', 'error');
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

// Fetch reports data
async function fetchReportsData() {
    try {
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        reportsData = generateMockReports(50);
        filteredReports = [...reportsData];
        
        // Update the UI with the reports
        updateReportsUI();
    } catch (error) {
        console.error('Error fetching reports:', error);
        showToast('Failed to load reports. Please try again.', 'error');
    }
}

// Generate mock reports data
function generateMockReports(count) {
    const types = ['traffic', 'accident', 'fire', 'crowd', 'surveillance'];
    const severities = ['low', 'medium', 'high'];
    const locations = [
        'North Sector, Highway 42',
        'East Sector, Junction 8',
        'West Sector, Building 7',
        'Central Area, Plaza',
        'South Sector, Residential Area',
        'North Sector, Main Street',
        'East Sector, Commercial District',
        'West Sector, Industrial Zone',
        'Central Area, City Hall',
        'South Sector, Park'
    ];
    
    const reports = [];
    
    for (let i = 1; i <= count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        
        // Generate a random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        let title, summary, metrics;
        
        switch (type) {
            case 'traffic':
                const vehicleCount = Math.floor(Math.random() * 500) + 50;
                const speed = Math.floor(Math.random() * 40) + 5;
                title = 'Traffic Analysis';
                summary = `Traffic ${severity === 'high' ? 'congestion' : 'flow'} detected with approximately ${vehicleCount} vehicles. Average speed: ${speed} km/h.`;
                metrics = {
                    confidence: Math.floor(Math.random() * 10) + 90 + '%',
                    vehicles: vehicleCount
                };
                break;
            case 'accident':
                const vehiclesInvolved = Math.floor(Math.random() * 3) + 1;
                title = 'Vehicle Collision Detected';
                summary = `${vehiclesInvolved}-vehicle collision detected at intersection. ${severity === 'high' ? 'Potential injuries. Emergency services notified.' : 'No injuries reported.'}`;
                metrics = {
                    confidence: Math.floor(Math.random() * 5) + 95 + '%',
                    vehicles: vehiclesInvolved
                };
                break;
            case 'fire':
                title = 'Fire Outbreak Detection';
                summary = `Fire detected in ${location.includes('Building') ? 'building' : 'area'}. Estimated size: ${severity === 'low' ? 'Small' : severity === 'medium' ? 'Medium' : 'Large'}. ${severity === 'high' ? 'Emergency services dispatched.' : ''}`;
                metrics = {
                    confidence: Math.floor(Math.random() * 10) + 90 + '%',
                    spread: severity === 'low' ? 'Small' : severity === 'medium' ? 'Medium' : 'Large'
                };
                break;
            case 'crowd':
                const peopleCount = Math.floor(Math.random() * 15) + 3;
                title = 'Crowd Altercation Detected';
                summary = `Physical altercation detected between approximately ${peopleCount} individuals. ${severity === 'high' ? 'Security personnel and authorities notified.' : 'Security personnel alerted.'}`;
                metrics = {
                    confidence: Math.floor(Math.random() * 15) + 85 + '%',
                    people: peopleCount
                };
                break;
            case 'surveillance':
                const vehiclesDetected = Math.floor(Math.random() * 2000) + 500;
                const peopleDetected = Math.floor(Math.random() * 5000) + 1000;
                title = 'Daily Surveillance Summary';
                summary = `24-hour surveillance summary. ${vehiclesDetected.toLocaleString()} vehicles, ${peopleDetected.toLocaleString()} pedestrians detected. ${severity === 'high' ? 'Several suspicious activities flagged.' : severity === 'medium' ? 'Few minor incidents noted.' : 'No significant incidents.'}`;
                metrics = {
                    vehicles: vehiclesDetected.toLocaleString(),
                    people: peopleDetected.toLocaleString()
                };
                break;
        }
        
        reports.push({
            id: i,
            type,
            severity,
            title,
            location,
            date,
            summary,
            metrics,
            saved: Math.random() > 0.8, // 20% chance of being saved
            coordinates: {
                lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                lng: -74.0060 + (Math.random() - 0.5) * 0.1
            }
        });
    }
    
    return reports;
}

// Update the UI with reports
function updateReportsUI() {
    const reportsGrid = document.querySelector('.reports-grid');
    const reportsList = document.querySelector('.reports-list');
    
    if (!reportsGrid || !reportsList) return;
    
    // Clear existing reports
    reportsGrid.innerHTML = '';
    reportsList.innerHTML = '';
    
    // Update the reports grid
    filteredReports.slice(0, 12).forEach(report => {
        reportsGrid.appendChild(createReportCard(report));
    });
    
    // Update the reports list
    filteredReports.slice(0, 10).forEach(report => {
        reportsList.appendChild(createListReport(report));
    });
    
    // Update high priority alerts
    updateHighPriorityAlerts();
    
    // Update saved reports
    updateSavedReports();
    
    // Update analytics
    updateAnalytics();
}

// Create a report card element
function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.dataset.id = report.id;
    
    const formattedDate = formatDate(report.date);
    
    card.innerHTML = `
        <div class="report-header">
            <span class="report-type ${report.type}">${capitalizeFirstLetter(report.type)}</span>
            <span class="report-severity ${report.severity}">${capitalizeFirstLetter(report.severity)}</span>
        </div>
        <div class="report-body">
            <h3>${report.title}</h3>
            <p class="report-location"><i class="fas fa-map-marker-alt"></i> ${report.location}</p>
            <p class="report-time"><i class="fas fa-clock"></i> ${formattedDate}</p>
            <p class="report-summary">${report.summary}</p>
            <div class="report-metrics">
                ${Object.entries(report.metrics).map(([key, value]) => `
                    <div class="metric">
                        <span class="metric-label">${capitalizeFirstLetter(key)}</span>
                        <span class="metric-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="report-footer">
            <button class="btn-outline btn-sm view-report" data-id="${report.id}">View Details</button>
            <div class="report-actions">
                <button class="action-btn download-report" title="Download Report" data-id="${report.id}"><i class="fas fa-download"></i></button>
                <button class="action-btn share-report" title="Share Report" data-id="${report.id}"><i class="fas fa-share-alt"></i></button>
                <button class="action-btn toggle-saved" title="${report.saved ? 'Unsave Report' : 'Save Report'}" data-id="${report.id}">
                    <i class="${report.saved ? 'fas' : 'far'} fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Create a list report element
function createListReport(report) {
    const listItem = document.createElement('div');
    listItem.className = 'list-report';
    listItem.dataset.id = report.id;
    
    const formattedDate = formatDate(report.date);
    
    let iconClass;
    switch (report.type) {
        case 'traffic': iconClass = 'fa-traffic-light'; break;
        case 'accident': iconClass = 'fa-car-crash'; break;
        case 'fire': iconClass = 'fa-fire'; break;
        case 'crowd': iconClass = 'fa-users'; break;
        case 'surveillance': iconClass = 'fa-video'; break;
        default: iconClass = 'fa-exclamation-circle';
    }
    
    listItem.innerHTML = `
        <div class="list-report-icon ${report.type}">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="list-report-content">
            <div class="list-report-header">
                <h3>${report.title}</h3>
                <span class="report-severity ${report.severity}">${capitalizeFirstLetter(report.severity)}</span>
            </div>
            <p class="list-report-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${report.location}</span>
                <span><i class="fas fa-clock"></i> ${formattedDate}</span>
            </p>
            <p class="list-report-summary">${report.summary}</p>
        </div>
        <div class="list-report-actions">
            <button class="btn-outline btn-sm view-report" data-id="${report.id}">View</button>
            <div class="action-icons">
                <button class="action-btn download-report" title="Download Report" data-id="${report.id}"><i class="fas fa-download"></i></button>
                <button class="action-btn share-report" title="Share Report" data-id="${report.id}"><i class="fas fa-share-alt"></i></button>
                <button class="action-btn toggle-saved" title="${report.saved ? 'Unsave Report' : 'Save Report'}" data-id="${report.id}">
                    <i class="${report.saved ? 'fas' : 'far'} fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    
    return listItem;
}

// Update high priority alerts
function updateHighPriorityAlerts() {
    const highPriorityContainer = document.querySelector('#high-priority');
    if (!highPriorityContainer) return;
    
    const alertsContainer = highPriorityContainer.querySelector('.priority-alerts');
    if (!alertsContainer) return;
    
    // Clear existing alerts
    alertsContainer.innerHTML = '';
    
    // Get high severity reports
    const highSeverityReports = filteredReports.filter(report => report.severity === 'high');
    
    if (highSeverityReports.length === 0) {
        alertsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>No High Priority Alerts</h3>
                <p>There are currently no high priority alerts that require your attention.</p>
            </div>
        `;
        return;
    }
    
    // Add high severity reports to the container
    highSeverityReports.slice(0, 5).forEach(report => {
        const alertCard = document.createElement('div');
        alertCard.className = 'alert-card';
        
        let iconClass;
        switch (report.type) {
            case 'traffic': iconClass = 'fa-traffic-light'; break;
            case 'accident': iconClass = 'fa-car-crash'; break;
            case 'fire': iconClass = 'fa-fire'; break;
            case 'crowd': iconClass = 'fa-users'; break;
            case 'surveillance': iconClass = 'fa-video'; break;
            default: iconClass = 'fa-exclamation-circle';
        }
        
        const daysAgo = getDaysAgo(report.date);
        
        alertCard.innerHTML = `
            <div class="alert-header ${report.type}">
                <i class="fas ${iconClass}"></i>
                <h3>${capitalizeFirstLetter(report.type)}</h3>
                <span class="alert-time">${daysAgo}</span>
            </div>
            <div class="alert-body">
                <p>${report.summary}</p>
                <div class="alert-actions">
                    <button class="btn-primary btn-sm view-report" data-id="${report.id}">View Details</button>
                    <button class="btn-outline btn-sm mark-resolved" data-id="${report.id}">Mark as Resolved</button>
                </div>
            </div>
        `;
        
        alertsContainer.appendChild(alertCard);
    });
}

// Update saved reports
function updateSavedReports() {
    const savedContainer = document.querySelector('#saved');
    if (!savedContainer) return;
    
    // Get saved reports
    const savedReports = filteredReports.filter(report => report.saved);
    
    if (savedReports.length === 0) {
        savedContainer.innerHTML = `
            <div class="saved-reports-empty">
                <div class="empty-state">
                    <i class="far fa-bookmark"></i>
                    <h3>No Saved Reports</h3>
                    <p>You haven't saved any reports yet. Click the bookmark icon on any report to save it for quick access.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Create a grid for saved reports
    const savedGrid = document.createElement('div');
    savedGrid.className = 'reports-grid';
    
    // Add saved reports to the grid
    savedReports.forEach(report => {
        savedGrid.appendChild(createReportCard(report));
    });
    
    // Update the container
    savedContainer.innerHTML = '';
    savedContainer.appendChild(savedGrid);
}

// Update analytics
function updateAnalytics() {
    // This would update any dynamic analytics that depend on the filtered reports
    // For now, we'll just use the static charts initialized earlier
}

// Initialize charts
function initializeCharts() {
    try {
        // Helper function to safely create a chart
        function createChartSafely(canvasId, chartType, chartData, chartOptions) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`Canvas element with ID '${canvasId}' not found.`);
                return null;
            }

            // Get the parent container to set appropriate dimensions
            const container = canvas.parentElement;
            if (container) {
                // Set explicit dimensions on the container to prevent layout shifts
                if (container.offsetWidth === 0) {
                    container.style.width = '100%';
                }

                if (container.offsetHeight === 0) {
                    // Set a reasonable fixed height based on container type
                    if (container.classList.contains('chart-container')) {
                        container.style.height = '250px';
                    } else {
                        container.style.height = '200px';
                    }
                }
            }

            // Ensure the canvas has dimensions before attempting to get context
            if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
                console.warn(`Canvas element with ID '${canvasId}' has zero width or height.`);
                // Set minimum dimensions to prevent errors
                canvas.width = canvas.width || 100;
                canvas.height = canvas.height || 100;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.maxHeight = '250px';
            }

            try {
                const ctx = canvas.getContext('2d');

                // Add default options to prevent excessive sizing
                const defaultOptions = {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2, // Width:Height ratio
                    onResize: (chart, size) => {
                        // Prevent charts from growing too large
                        if (size.height > 300) {
                            size.height = 300;
                        }
                    }
                };

                // Merge default options with provided options
                const mergedOptions = { ...defaultOptions, ...chartOptions };

                return new Chart(ctx, {
                    type: chartType,
                    data: chartData,
                    options: mergedOptions
                });
            } catch (error) {
                console.error(`Error creating chart for '${canvasId}':`, error);
                return null;
            }
        }

        // Incident Distribution Pie Chart removed

        // Weekly Trend Chart removed

        // Incident Trends Chart (Analytics Tab)
        const incidentTrendsChart = createChartSafely('incidentTrendsChart', 'line', {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Traffic',
                    data: [65, 59, 80, 81, 56, 55, 40, 45, 50, 55, 60, 70],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Accident',
                    data: [28, 48, 40, 19, 26, 27, 30, 33, 35, 30, 25, 20],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Fire',
                    data: [10, 15, 20, 25, 30, 35, 25, 20, 15, 10, 5, 10],
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        }, {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        });

        // Incident Type Chart removed

        // Severity Chart (Analytics Tab)
        const severityChart = createChartSafely('severityChart', 'bar', {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
                label: 'Incidents by Severity',
                data: [45, 35, 20],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 0
            }]
        }, {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        });

        // Accuracy Chart removed to fix infinite scrolling issue

        // Ensure charts are properly sized when tab becomes visible
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 100);
            });
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Initialize map
function initializeMap() {
    try {
        const mapContainer = document.getElementById('incidentMap');
        if (!mapContainer) {
            console.warn('Map container not found');
            return;
        }

        // Get the parent container to set appropriate dimensions
        const parentContainer = mapContainer.parentElement;
        if (parentContainer) {
            // Ensure the parent container has a fixed height to prevent infinite growth
            parentContainer.style.height = '300px';
            parentContainer.style.maxHeight = '300px';
            parentContainer.style.overflow = 'hidden';
        }

        // Check if the map container has dimensions
        if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {
            console.warn('Map container has zero width or height');
            // Set fixed dimensions to prevent errors and infinite growth
            mapContainer.style.width = '100%';
            mapContainer.style.height = '300px';
            mapContainer.style.maxHeight = '300px';
        }

        // Check if Leaflet is available
        if (!window.L) {
            console.error('Leaflet library not loaded');
            return;
        }

        // Create the map
        const map = L.map('incidentMap').setView([40.7128, -74.0060], 12);

        // Add the tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add markers for each report
        filteredReports.forEach(report => {
            try {
                const { lat, lng } = report.coordinates;

                // Validate coordinates
                if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                    console.warn(`Invalid coordinates for report ${report.id}`);
                    return;
                }

                let iconColor;
                switch (report.type) {
                    case 'traffic': iconColor = 'blue'; break;
                    case 'accident': iconColor = 'red'; break;
                    case 'fire': iconColor = 'orange'; break;
                    case 'crowd': iconColor = 'purple'; break;
                    case 'surveillance': iconColor = 'green'; break;
                    default: iconColor = 'gray';
                }

                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(`
                    <strong>${report.title}</strong><br>
                    ${report.location}<br>
                    ${formatDate(report.date)}<br>
                    <span class="report-severity ${report.severity}">${capitalizeFirstLetter(report.severity)}</span>
                `);
            } catch (markerError) {
                console.error('Error adding marker:', markerError);
            }
        });

        // Add heatmap if the heatmap plugin is available
        if (L.heatLayer) {
            try {
                const heatData = filteredReports
                    .filter(report => {
                        const { lat, lng } = report.coordinates;
                        return lat && lng && !isNaN(lat) && !isNaN(lng);
                    })
                    .map(report => {
                        const intensity = report.severity === 'high' ? 1.0 :
                                        report.severity === 'medium' ? 0.7 : 0.4;
                        return [report.coordinates.lat, report.coordinates.lng, intensity];
                    });

                if (heatData.length > 0) {
                    const heatmapLayer = L.heatLayer(heatData, {
                        radius: 25,
                        blur: 15,
                        maxZoom: 10,
                        gradient: {
                            0.4: 'blue',
                            0.6: 'lime',
                            0.8: 'yellow',
                            1.0: 'red'
                        }
                    }).addTo(map);

                    // Add layer control
                    const baseLayers = {
                        "Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
                    };

                    const overlays = {
                        "Markers": L.layerGroup(),
                        "Heatmap": heatmapLayer
                    };

                    L.control.layers(baseLayers, overlays).addTo(map);
                } else {
                    console.warn('No valid heat data points available');
                }
            } catch (heatmapError) {
                console.error('Error creating heatmap:', heatmapError);
            }
        } else {
            console.warn('Leaflet heatmap plugin not available');
        }

        // Ensure map is properly sized when tab becomes visible
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            });
        });

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            switchView(view);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('reportSearch');
    if (searchInput) {
        // Clear any previous event listeners
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);

        // Add event listener for input with debounce
        newSearchInput.addEventListener('input', debounce(() => {
            const searchTerm = newSearchInput.value.toLowerCase().trim();

            // Only filter if search term is at least 2 characters or empty
            if (searchTerm.length === 0 || searchTerm.length >= 2) {
                filterReports({ searchTerm });

                // Show feedback to user
                if (searchTerm.length > 0) {
                    showToast(`Searching for "${searchTerm}"...`, 'info');
                }
            }
        }, 300));

        // Add event listener for Enter key
        newSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = newSearchInput.value.toLowerCase().trim();
                if (searchTerm.length > 0) {
                    filterReports({ searchTerm });
                    showToast(`Showing results for "${searchTerm}"`, 'info');
                }
            }
        });

        // Add clear search button functionality
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                if (newSearchInput.value.length > 0) {
                    newSearchInput.value = '';
                    filterReports({});
                    showToast('Search cleared', 'info');
                } else {
                    newSearchInput.focus();
                }
            });
        }
    }
    
    // Filter application
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
        });
    }
    
    // Filter reset
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            resetFilters();
        });
    }
    
    // View report details
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-report') || e.target.closest('.view-report')) {
            const button = e.target.classList.contains('view-report') ? e.target : e.target.closest('.view-report');
            const reportId = button.dataset.id;
            viewReportDetails(reportId);
        }
    });
    
    // Download report
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('download-report') || e.target.closest('.download-report')) {
            const button = e.target.classList.contains('download-report') ? e.target : e.target.closest('.download-report');
            const reportId = button.dataset.id;
            openExportModal(reportId);
        }
    });
    
    // Share report
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('share-report') || e.target.closest('.share-report')) {
            const button = e.target.classList.contains('share-report') ? e.target : e.target.closest('.share-report');
            const reportId = button.dataset.id;
            openShareModal(reportId);
        }
    });
    
    // Toggle saved status
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('toggle-saved') || e.target.closest('.toggle-saved')) {
            const button = e.target.classList.contains('toggle-saved') ? e.target : e.target.closest('.toggle-saved');
            const reportId = button.dataset.id;
            toggleSavedStatus(reportId);
        }
    });
    
    // Mark as resolved
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mark-resolved') || e.target.closest('.mark-resolved')) {
            const button = e.target.classList.contains('mark-resolved') ? e.target : e.target.closest('.mark-resolved');
            const reportId = button.dataset.id;
            markAsResolved(reportId);
        }
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

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // If switching to analytics tab, handle special requirements
    if (tabName === 'analytics') {
        // Reset scroll position to prevent infinite scrolling issues
        const analyticsTab = document.getElementById('analytics');
        if (analyticsTab) {
            const dashboard = analyticsTab.querySelector('.analytics-dashboard');
            if (dashboard) {
                dashboard.scrollTop = 0;
            }
        }

        // Resize charts after a short delay to ensure proper rendering
        setTimeout(() => {
            // Trigger resize event for charts
            window.dispatchEvent(new Event('resize'));

            // Invalidate map size if it exists
            const map = document.getElementById('incidentMap');
            if (map && map._leaflet_id) {
                try {
                    const leafletMap = L.DomUtil.get('incidentMap')._leaflet_id;
                    if (leafletMap) {
                        leafletMap.invalidateSize();
                    }
                } catch (e) {
                    console.warn('Could not invalidate map size:', e);
                }
            }
        }, 300);
    }
}

// Switch between grid and list views
function switchView(view) {
    currentView = view;
    
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.view-btn[data-view="${view}"]`).classList.add('active');
    
    // Update the reports container
    const reportsContainer = document.querySelector('#all');
    if (!reportsContainer) return;
    
    if (view === 'grid') {
        // Switch to grid view
        let gridContainer = reportsContainer.querySelector('.reports-grid');
        if (!gridContainer) {
            gridContainer = document.createElement('div');
            gridContainer.className = 'reports-grid';
            
            // Add reports to the grid
            filteredReports.slice(0, 12).forEach(report => {
                gridContainer.appendChild(createReportCard(report));
            });
            
            // Replace the list with the grid
            const listContainer = reportsContainer.querySelector('.reports-list');
            if (listContainer) {
                reportsContainer.replaceChild(gridContainer, listContainer);
            } else {
                reportsContainer.insertBefore(gridContainer, reportsContainer.querySelector('.pagination'));
            }
        }
    } else if (view === 'list') {
        // Switch to list view
        let listContainer = reportsContainer.querySelector('.reports-list');
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.className = 'reports-list';
            
            // Add reports to the list
            filteredReports.slice(0, 10).forEach(report => {
                listContainer.appendChild(createListReport(report));
            });
            
            // Replace the grid with the list
            const gridContainer = reportsContainer.querySelector('.reports-grid');
            if (gridContainer) {
                reportsContainer.replaceChild(listContainer, gridContainer);
            } else {
                reportsContainer.insertBefore(listContainer, reportsContainer.querySelector('.pagination'));
            }
        }
    }
}

// Apply filters
function applyFilters() {
    // Get filter values
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    const incidentTypes = Array.from(document.querySelectorAll('input[type="checkbox"][value^="traffic"], input[type="checkbox"][value^="accident"], input[type="checkbox"][value^="fire"], input[type="checkbox"][value^="crowd"], input[type="checkbox"][value^="surveillance"]'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    const severityLevels = Array.from(document.querySelectorAll('input[type="checkbox"][value^="low"], input[type="checkbox"][value^="medium"], input[type="checkbox"][value^="high"]'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    const location = document.getElementById('locationFilter').value;
    
    // Apply filters
    filterReports({
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
        incidentTypes,
        severityLevels,
        location
    });
    
    // Show toast
    showToast('Filters applied successfully!', 'success');
}

// Reset filters
function resetFilters() {
    // Reset date inputs
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Reset location select
    document.getElementById('locationFilter').value = '';
    
    // Reset filtered reports
    filteredReports = [...reportsData];
    updateReportsUI();
    
    // Show toast
    showToast('Filters reset successfully!', 'success');
}

// Filter reports
function filterReports(filters) {
    try {
        const { searchTerm, dateFrom, dateTo, incidentTypes, severityLevels, location } = filters;

        // Start with all reports
        filteredReports = [...reportsData];

        // Apply search term filter if provided
        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            filteredReports = filteredReports.filter(report =>
                report.title.toLowerCase().includes(term) ||
                report.summary.toLowerCase().includes(term) ||
                report.location.toLowerCase().includes(term)
            );
        }

        // Apply date range filter if provided
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0); // Start of day
            filteredReports = filteredReports.filter(report => new Date(report.date) >= fromDate);
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            filteredReports = filteredReports.filter(report => new Date(report.date) <= toDate);
        }

        // Apply incident type filter if provided
        if (incidentTypes && incidentTypes.length > 0) {
            filteredReports = filteredReports.filter(report => incidentTypes.includes(report.type));
        }

        // Apply severity level filter if provided
        if (severityLevels && severityLevels.length > 0) {
            filteredReports = filteredReports.filter(report => severityLevels.includes(report.severity));
        }

        // Apply location filter if provided
        if (location) {
            const locationTerm = location.toLowerCase().trim();
            filteredReports = filteredReports.filter(report =>
                report.location.toLowerCase().includes(locationTerm)
            );
        }

        // Show a message if no reports match the filters
        if (filteredReports.length === 0) {
            showToast('No reports match your filter criteria. Try adjusting your filters.', 'info');
        }

        // Update the UI with the filtered reports
        updateReportsUI();

    } catch (error) {
        console.error('Error filtering reports:', error);
        showToast('Error applying filters. Please try again.', 'error');

        // Reset to all reports in case of error
        filteredReports = [...reportsData];
        updateReportsUI();
    }
}

// View report details
function viewReportDetails(reportId) {
    try {
        // Find the report in our data
        const report = reportsData.find(r => r.id.toString() === reportId.toString());

        if (!report) {
            showToast(`Report with ID ${reportId} not found`, 'error');
            return;
        }

        // Store the report data in sessionStorage so it can be accessed on the detail page
        sessionStorage.setItem('currentReport', JSON.stringify(report));

        // Show a loading toast
        showToast(`Loading report details...`, 'info');

        // Redirect to the report detail page with the ID as a query parameter
        window.location.href = `report-detail.html?id=${reportId}`;
    } catch (error) {
        console.error('Error viewing report details:', error);
        showToast('Error loading report details. Please try again.', 'error');
    }
}

// Open export modal
function openExportModal(reportId) {
    const modal = document.getElementById('exportReportModal');
    if (modal) {
        modal.classList.add('active');
        
        // Store the report ID in the modal for reference
        modal.dataset.reportId = reportId;
    }
}

// Open share modal
function openShareModal(reportId) {
    const modal = document.getElementById('shareReportModal');
    if (modal) {
        modal.classList.add('active');
        
        // Store the report ID in the modal for reference
        modal.dataset.reportId = reportId;
        
        // Update the share link
        const shareLink = document.getElementById('shareLink');
        if (shareLink) {
            shareLink.value = `https://alertx.com/reports/${reportId}`;
        }
    }
}

// Toggle saved status
function toggleSavedStatus(reportId) {
    const reportIndex = reportsData.findIndex(report => report.id.toString() === reportId.toString());
    if (reportIndex !== -1) {
        // Toggle the saved status
        reportsData[reportIndex].saved = !reportsData[reportIndex].saved;
        
        // Update the UI
        updateReportsUI();
        
        // Show toast
        const savedStatus = reportsData[reportIndex].saved;
        showToast(`Report ${savedStatus ? 'saved' : 'unsaved'} successfully!`, 'success');
        
        // Update the button icon in all instances
        document.querySelectorAll(`.toggle-saved[data-id="${reportId}"]`).forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = savedStatus ? 'fas fa-bookmark' : 'far fa-bookmark';
            }
            button.title = savedStatus ? 'Unsave Report' : 'Save Report';
        });
    }
}

// Mark as resolved
function markAsResolved(reportId) {
    const reportIndex = reportsData.findIndex(report => report.id.toString() === reportId.toString());
    if (reportIndex !== -1) {
        // Mark the report as resolved (low severity)
        reportsData[reportIndex].severity = 'low';
        
        // Update the UI
        updateReportsUI();
        
        // Show toast
        showToast('Report marked as resolved!', 'success');
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
        gsap.to('.reports-container', {
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
    // Animate overview cards
    gsap.from('.overview-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });
    
    // Animate report cards
    gsap.from('.report-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3
    });
    
    // Animate sidebar
    gsap.from('.reports-sidebar', {
        x: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
    });
}

// Helper Functions

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Get days ago
function getDaysAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else {
        return `${diffDays} days ago`;
    }
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
        initializeReports();
    } else {
        console.error('Supabase client not available');
        alert('Error: Authentication service not available. Please try again later.');
    }
});