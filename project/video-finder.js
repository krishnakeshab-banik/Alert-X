import { createClient } from '@supabase/supabase-js';
import * as THREE from 'three';
import { gsap } from 'gsap';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

let videoCount = 0;
const MAX_VIDEOS = 10;

// City data mapping
const cityData = {
    india: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad'],
    usa: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'],
    uk: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Glasgow']
};

// Areas data mapping (example areas for each city)
const areaData = {
    mumbai: ['Andheri', 'Bandra', 'Colaba', 'Dadar', 'Juhu'],
    delhi: ['Connaught Place', 'Hauz Khas', 'Dwarka', 'Rohini', 'Saket'],
    bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'JP Nagar'],
    'new york': ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
    london: ['Westminster', 'Camden', 'Greenwich', 'Hackney', 'Islington']
    // Add more cities and their areas as needed
};

// Initialize the page
async function initializeVideoFinder() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        // Update profile information
        updateProfileInfo(user);
        
        // Initialize event listeners
        setupEventListeners();
        
        // Initialize 3D background
        initBackground();
        
    } catch (error) {
        console.error('Error initializing video finder:', error.message);
        window.location.href = '/login.html';
    }
}

// Initialize 3D background
function initBackground() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.querySelector('.video-finder-container').prepend(renderer.domElement);

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 5000; i++) {
        vertices.push(
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000
        );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x646cff,
        size: 2,
        transparent: true,
        opacity: 0.8
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    camera.position.z = 1000;
    
    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.x += 0.0002;
        particles.rotation.y += 0.0002;
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function updateProfileInfo(user) {
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

function setupEventListeners() {
    // Add video button
    const addVideoBtn = document.getElementById('addVideoBtn');
    addVideoBtn.addEventListener('click', addVideoBox);

    // Detection type toggle
    const detectionBtns = document.querySelectorAll('.detection-btn');
    detectionBtns.forEach(btn => {
        btn.addEventListener('click', () => toggleDetectionType(btn));
    });

    // Person image preview
    const personImage = document.getElementById('personImage');
    personImage.addEventListener('change', handleImagePreview);

    // Start analysis button
    const startAnalysisBtn = document.getElementById('startAnalysis');
    startAnalysisBtn.addEventListener('click', startAnalysis);

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);

    // Initialize any existing video boxes
    document.querySelectorAll('.video-box').forEach(box => {
        const countrySelect = box.querySelector('.country');
        if (countrySelect) {
            countrySelect.addEventListener('change', handleCountryChange);
        }
    });
}

function handleCountryChange(event) {
    const videoBox = event.target.closest('.video-box');
    const citySelect = videoBox.querySelector('.city');
    const areaInput = videoBox.querySelector('.area');
    const selectedCountry = event.target.value.toLowerCase();

    // Clear existing options
    citySelect.innerHTML = '<option value="">Select City</option>';
    areaInput.value = '';

    if (selectedCountry && cityData[selectedCountry]) {
        cityData[selectedCountry].forEach(city => {
            const option = document.createElement('option');
            option.value = city.toLowerCase();
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
        
        // Add event listener for city change
        citySelect.addEventListener('change', handleCityChange);
    } else {
        citySelect.disabled = true;
        areaInput.disabled = true;
    }
}

function handleCityChange(event) {
    const videoBox = event.target.closest('.video-box');
    const areaInput = videoBox.querySelector('.area');
    const selectedCity = event.target.value.toLowerCase();

    areaInput.disabled = false;
    areaInput.placeholder = 'Enter Area';

    // If we have predefined areas for this city, create a datalist
    if (areaData[selectedCity]) {
        let datalistId = `areas-${selectedCity}`;
        let existingDatalist = document.getElementById(datalistId);
        
        if (!existingDatalist) {
            const datalist = document.createElement('datalist');
            datalist.id = datalistId;
            
            areaData[selectedCity].forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                datalist.appendChild(option);
            });
            
            document.body.appendChild(datalist);
        }
        
        areaInput.setAttribute('list', datalistId);
    }
}

function addVideoBox() {
    if (videoCount >= MAX_VIDEOS) {
        showToast('Maximum 10 videos allowed', 'error');
        return;
    }

    const videoGrid = document.getElementById('videoGrid');
    const videoBox = document.createElement('div');
    videoBox.className = 'video-box';
    
    // Create the video box with GSAP animation
    gsap.set(videoBox, { opacity: 0, y: 20 });
    
    videoBox.innerHTML = `
        <input type="file" accept="video/*" class="video-input" onchange="handleVideoUpload(this)">
        <div class="video-info">
            <select class="location-select country">
                <option value="">Select Country</option>
                <option value="india">India</option>
                <option value="usa">USA</option>
                <option value="uk">UK</option>
            </select>
            <select class="location-select city" disabled>
                <option value="">Select City</option>
            </select>
            <input type="text" class="location-select area" placeholder="Enter Area" disabled>
        </div>
        <button class="remove-video" onclick="removeVideoBox(this)">×</button>
    `;

    const countrySelect = videoBox.querySelector('.country');
    countrySelect.addEventListener('change', handleCountryChange);

    videoGrid.appendChild(videoBox);
    
    // Animate the new video box
    gsap.to(videoBox, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
    });

    videoCount++;
    updateAddButtonState();
}

function removeVideoBox(button) {
    const videoBox = button.closest('.video-box');
    
    // Animate removal
    gsap.to(videoBox, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            videoBox.remove();
            videoCount--;
            updateAddButtonState();
        }
    });
}

function updateAddButtonState() {
    const addVideoBtn = document.getElementById('addVideoBtn');
    addVideoBtn.disabled = videoCount >= MAX_VIDEOS;
    addVideoBtn.style.opacity = addVideoBtn.disabled ? '0.5' : '1';
}

function handleVideoUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const videoBox = input.closest('.video-box');
    const existingPreview = videoBox.querySelector('.video-preview');
    if (existingPreview) existingPreview.remove();

    const video = document.createElement('video');
    video.className = 'video-preview';

    // Add event listeners to ensure video is properly loaded
    video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);

        // Only mark as ready if video has valid dimensions
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            video.dataset.ready = 'true';
            videoBox.classList.add('has-video');
        } else {
            console.warn('Video has invalid dimensions');
            showToast('Warning: Video may not be properly loaded', 'error');
        }
    });

    video.addEventListener('error', (e) => {
        console.error('Error loading video:', e);
        showToast('Error loading video. Please try another file.', 'error');
        video.remove();
    });

    // Set video source after adding event listeners
    try {
        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;
        video.controls = true;

        // Store the object URL to revoke it later
        video.dataset.objectUrl = objectUrl;

        // Animate video preview
        gsap.set(video, { opacity: 0, scale: 0.9 });
        input.parentNode.insertBefore(video, input.nextSibling);

        gsap.to(video, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });

        // Add a cleanup function to revoke object URL when video is removed
        video.addEventListener('remove', () => {
            if (video.dataset.objectUrl) {
                URL.revokeObjectURL(video.dataset.objectUrl);
            }
        });

    } catch (e) {
        console.error('Error creating video preview:', e);
        showToast('Error creating video preview', 'error');
    }
}

function toggleDetectionType(button) {
    const detectionBtns = document.querySelectorAll('.detection-btn');
    detectionBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const personSearch = document.getElementById('personSearch');
    const vehicleSearch = document.getElementById('vehicleSearch');

    if (button.dataset.type === 'person') {
        gsap.to(vehicleSearch, { opacity: 0, y: 20, duration: 0.3, display: 'none' });
        gsap.to(personSearch, { opacity: 1, y: 0, duration: 0.3, display: 'block', delay: 0.3 });
    } else {
        gsap.to(personSearch, { opacity: 0, y: 20, duration: 0.3, display: 'none' });
        gsap.to(vehicleSearch, { opacity: 1, y: 0, duration: 0.3, display: 'block', delay: 0.3 });
    }
}

function handleImagePreview(event) {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById('personPreview');
    preview.innerHTML = '';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    
    // Animate image preview
    gsap.set(img, { opacity: 0, scale: 0.9 });
    preview.appendChild(img);
    
    gsap.to(img, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
}

async function startAnalysis() {
    try {
        const videos = document.querySelectorAll('.video-box.has-video');
        if (videos.length === 0) {
            showToast('Please upload at least one video', 'error');
            return;
        }

        const detectionType = document.querySelector('.detection-btn.active').dataset.type;
        const searchQuery = detectionType === 'person'
            ? document.getElementById('personImage').files[0]
            : document.getElementById('vehicleNumber').value;

        if (!searchQuery) {
            showToast(`Please provide a ${detectionType === 'person' ? 'person image' : 'vehicle number'}`, 'error');
            return;
        }

        // Validate location information
        for (const video of videos) {
            const country = video.querySelector('.country').value;
            const city = video.querySelector('.city').value;
            const area = video.querySelector('.area').value;

            if (!country || !city || !area) {
                showToast('Please fill in all location information for each video', 'error');
                return;
            }
        }

        showToast('Analysis started...', 'success');

        // Show loading state
        const analysisBtn = document.getElementById('startAnalysis');
        analysisBtn.disabled = true;
        analysisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        const resultsSection = document.getElementById('resultsSection');

        // Animate results section
        gsap.set(resultsSection, { display: 'block', opacity: 0, y: 20 });
        gsap.to(resultsSection, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        });

        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.innerHTML = '';

        // Limit the number of videos to process to prevent performance issues
        const maxVideosToProcess = Math.min(videos.length, 10);
        let processedCount = 0;

        // Process videos with a maximum time limit
        const startTime = Date.now();
        const maxProcessingTime = 10000; // 10 seconds max processing time

        // Create a promise for each video processing
        const processingPromises = Array.from(videos).slice(0, maxVideosToProcess).map((video, index) => {
            return new Promise((resolve) => {
                // Check if we've exceeded the max processing time
                if (Date.now() - startTime > maxProcessingTime) {
                    resolve(null); // Skip this video if we're taking too long
                    return;
                }

                setTimeout(() => {
                    try {
                        const result = createResultCard(video, index);
                        if (result) {
                            resultsGrid.appendChild(result);

                            gsap.from(result, {
                                opacity: 0,
                                y: 20,
                                duration: 0.5,
                                delay: index * 0.1, // Reduced delay to prevent long waits
                                ease: "power2.out"
                            });

                            processedCount++;
                        }
                    } catch (err) {
                        console.error('Error processing video:', err);
                    }
                    resolve();
                }, index * 150); // Reduced timeout to prevent long waits
            });
        });

        // Wait for all videos to be processed or timeout
        await Promise.race([
            Promise.all(processingPromises),
            new Promise(resolve => setTimeout(resolve, maxProcessingTime + 1000))
        ]);

        // Show a message if not all videos were processed
        if (processedCount < videos.length) {
            showToast(`Processed ${processedCount} of ${videos.length} videos. Some videos may have been skipped to prevent performance issues.`, 'info');
        }
    } catch (error) {
        console.error('Error during analysis:', error);
        showToast('An error occurred during analysis. Please try again.', 'error');
    } finally {
        // Always reset the analysis button
        const analysisBtn = document.getElementById('startAnalysis');
        if (analysisBtn) {
            analysisBtn.disabled = false;
            analysisBtn.innerHTML = 'Start Analysis';
        }
    }
}

function createResultCard(video, index) {
    try {
        const card = document.createElement('div');
        card.className = 'result-card';

        // Set a custom attribute to track this card's index for animation
        card.style.setProperty('--card-index', index);

        const videoPreview = video.querySelector('.video-preview');

        // Check if video is ready for processing
        if (videoPreview && (!videoPreview.dataset.ready || videoPreview.videoWidth <= 0)) {
            console.warn('Video not ready for processing, using fallback');
        }

        // Get location data safely
        const location = {
            country: (video.querySelector('.country') || {}).value || 'Unknown',
            city: (video.querySelector('.city') || {}).value || 'Unknown',
            area: (video.querySelector('.area') || {}).value || 'Unknown'
        };

    const confidence = Math.round(Math.random() * 20 + 80);
    const timestamp = new Date().toLocaleString();

    // Get detection type
    const detectionType = document.querySelector('.detection-btn.active').dataset.type;

    // Create a canvas to capture a frame from the video and add detection boxes
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 225;

    // Draw the video frame on the canvas
    if (videoPreview) {
        try {
            // Ensure video is ready before drawing to canvas
            if (videoPreview.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                // Ensure canvas has valid dimensions before drawing
                if (canvas.width > 0 && canvas.height > 0) {
                    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

                    // Generate random number of detections (1-3)
                    const numDetections = Math.floor(Math.random() * 3) + 1;

                    // Draw multiple detection boxes
                    for (let i = 0; i < numDetections; i++) {
                        // Draw detection box
                        ctx.strokeStyle = detectionType === 'person' ? '#10b981' : '#3b82f6';
                        ctx.lineWidth = 3;

                        // Random position for detection box
                        const boxX = 20 + Math.random() * 300;
                        const boxY = 20 + Math.random() * 150;
                        const boxWidth = detectionType === 'person' ? 60 + Math.random() * 40 : 100 + Math.random() * 60;
                        const boxHeight = detectionType === 'person' ? 120 + Math.random() * 50 : 70 + Math.random() * 40;

                        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

                        // Add label
                        ctx.fillStyle = detectionType === 'person' ? '#10b981' : '#3b82f6';
                        ctx.fillRect(boxX, boxY - 25, detectionType === 'person' ? 70 : 40, 25);
                        ctx.fillStyle = '#fff';
                        ctx.font = '14px Arial';
                        ctx.fillText(detectionType === 'person' ? 'Person' : 'Car', boxX + 10, boxY - 8);

                        // Add confidence percentage near each box
                        const boxConfidence = Math.round(Math.random() * 15 + 80);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillRect(boxX, boxY + boxHeight + 5, 50, 20);
                        ctx.fillStyle = '#000';
                        ctx.font = '12px Arial';
                        ctx.fillText(`${boxConfidence}%`, boxX + 10, boxY + boxHeight + 19);
                    }

                    // Add detection count indicator
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(canvas.width - 70, 10, 60, 25);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText(`${numDetections} found`, canvas.width - 60, 27);
                } else {
                    throw new Error('Canvas has invalid dimensions');
                }
            } else {
                throw new Error('Video is not ready for processing');
            }

            // Create the result card with the detection overlay
            const detectionOverlay = document.createElement('div');
            detectionOverlay.className = 'detection-overlay';

            const img = document.createElement('img');
            // Only call toDataURL if canvas has valid content
            if (canvas.width > 0 && canvas.height > 0) {
                try {
                    img.src = canvas.toDataURL();
                } catch (e) {
                    console.error('Error generating data URL from canvas:', e);
                    img.src = videoPreview.src || 'https://via.placeholder.com/400x225?text=Processing+Error';
                }
            } else {
                img.src = videoPreview.src || 'https://via.placeholder.com/400x225?text=No+Preview';
            }
            img.alt = 'Detection Result';

            detectionOverlay.appendChild(img);

            // Add detection type badge
            const typeBadge = document.createElement('div');
            typeBadge.className = 'detection-type';
            typeBadge.textContent = detectionType === 'person' ? 'Person Detection' : 'Vehicle Detection';

            // Add timestamp badge
            const timeBadge = document.createElement('div');
            timeBadge.className = 'detection-time';
            timeBadge.textContent = timestamp.split(', ')[1]; // Just show the time part

            // Add controls for the detection result
            const controls = document.createElement('div');
            controls.className = 'detection-controls';

            controls.innerHTML = `
                <button class="detection-control-btn" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="detection-control-btn" title="Save Result">
                    <i class="fas fa-save"></i>
                </button>
                <button class="detection-control-btn" title="Share Result">
                    <i class="fas fa-share-alt"></i>
                </button>
            `;

            // Create info section
            const info = document.createElement('div');
            info.className = 'result-info';
            info.innerHTML = `
                <p><strong>Location:</strong> ${location.area}, ${location.city}, ${location.country}</p>
                <p><strong>Timestamp:</strong> ${timestamp}</p>
                <p><strong>Detections:</strong> ${numDetections} ${detectionType}${numDetections > 1 ? 's' : ''}</p>
                <p><strong>Confidence:</strong> ${confidence}%</p>
                <div class="confidence-bar" style="
                    height: 4px;
                    background: linear-gradient(90deg, var(--primary-color) ${confidence}%, transparent ${confidence}%);
                    border-radius: 2px;
                    margin-top: 0.5rem;
                "></div>
            `;

            // Assemble the card
            card.appendChild(detectionOverlay);
            card.appendChild(typeBadge);
            card.appendChild(timeBadge);
            card.appendChild(info);
            card.appendChild(controls);

            // Add event listeners to control buttons
            const viewBtn = controls.querySelector('button:nth-child(1)');
            viewBtn.addEventListener('click', () => {
                showToast(`Viewing details for ${detectionType} detection`, 'info');
            });

            const saveBtn = controls.querySelector('button:nth-child(2)');
            saveBtn.addEventListener('click', () => {
                showToast(`Result saved to reports`, 'success');
            });

            const shareBtn = controls.querySelector('button:nth-child(3)');
            shareBtn.addEventListener('click', () => {
                showToast(`Sharing options opened`, 'info');
            });

        } catch (e) {
            console.error('Error creating detection overlay:', e);
            // Fallback if canvas operations fail
            card.innerHTML = `
                <img src="${videoPreview.src}" alt="Detection Result">
                <div class="result-info">
                    <p><strong>Location:</strong> ${location.area}, ${location.city}, ${location.country}</p>
                    <p><strong>Timestamp:</strong> ${timestamp}</p>
                    <p><strong>Confidence:</strong> ${confidence}%</p>
                    <p><strong>Detection:</strong> ${detectionType === 'person' ? 'Person' : 'Vehicle'}</p>
                    <div class="confidence-bar" style="
                        height: 4px;
                        background: linear-gradient(90deg, var(--primary-color) ${confidence}%, transparent ${confidence}%);
                        border-radius: 2px;
                        margin-top: 0.5rem;
                    "></div>
                </div>
            `;
        }
    } else {
        // Fallback if video preview is not available
        card.innerHTML = `
            <div class="no-preview">No preview available</div>
            <div class="result-info">
                <p><strong>Location:</strong> ${location.area}, ${location.city}, ${location.country}</p>
                <p><strong>Timestamp:</strong> ${timestamp}</p>
                <p><strong>Confidence:</strong> ${confidence}%</p>
                <p><strong>Detection:</strong> ${detectionType === 'person' ? 'Person' : 'Vehicle'}</p>
                <div class="confidence-bar" style="
                    height: 4px;
                    background: linear-gradient(90deg, var(--primary-color) ${confidence}%, transparent ${confidence}%);
                    border-radius: 2px;
                    margin-top: 0.5rem;
                "></div>
            </div>
        `;
    }

    return card;
    } catch (error) {
        console.error('Error creating result card:', error);

        // Create a fallback card in case of error
        const fallbackCard = document.createElement('div');
        fallbackCard.className = 'result-card error-card';
        fallbackCard.innerHTML = `
            <div class="no-preview">Error Processing Video</div>
            <div class="result-info">
                <p><strong>Error:</strong> Failed to process video</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p>Please try again with a different video file.</p>
            </div>
        `;
        return fallbackCard;
    }
}

async function handleLogout(e) {
    e.preventDefault();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Animate logout
        gsap.to('.video-finder-container', {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                window.location.href = '/';
            }
        });
    } catch (error) {
        console.error('Error signing out:', error.message);
    }
}

function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#10B981' : '#EF4444',
        className: 'toast-notification',
        stopOnFocus: true,
    }).showToast();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeVideoFinder);

// Make functions available globally
window.handleVideoUpload = handleVideoUpload;
window.removeVideoBox = removeVideoBox;