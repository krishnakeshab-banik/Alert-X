// Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Initialize AOS animations
document.addEventListener('DOMContentLoaded', () => {
    // Check if AOS is available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 100,
        });
    }
});

// 3D Animation for Hero Section
function initThreeAnimation() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x646cff,
        transparent: true,
        opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add a sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x646cff,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    camera.position.z = 3;

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        particlesMesh.rotation.x += 0.001;
        particlesMesh.rotation.y += 0.001;

        sphere.rotation.x += 0.002;
        sphere.rotation.y += 0.002;

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    });
}

// Initialize 3D animation
document.addEventListener('DOMContentLoaded', initThreeAnimation);

// Animated Counter
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Animate all counters when they come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number, .counter');
            counters.forEach(counter => {
                animateCounter(counter);
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe elements containing counters
document.addEventListener('DOMContentLoaded', () => {
    const statsContainers = document.querySelectorAll('.hero-stats, .stats-grid');
    statsContainers.forEach(container => {
        counterObserver.observe(container);
    });
});

// Enhanced Testimonial Slider
const testimonials = document.querySelectorAll('.testimonial');
const sliderDots = document.querySelector('.slider-dots');
let currentTestimonial = 0;

// Create slider dots
if (testimonials.length > 0 && sliderDots) {
    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showTestimonial(index));
        sliderDots.appendChild(dot);
    });
}

function showTestimonial(index) {
    testimonials.forEach(testimonial => testimonial.classList.remove('active'));
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));

    testimonials[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentTestimonial = index;
}

// Auto-advance testimonials
if (testimonials.length > 0) {
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 6000);
}

// Add arrow navigation for testimonials
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');

if (prevArrow) {
    prevArrow.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
    });
}

if (nextArrow) {
    nextArrow.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // Account for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Newsletter form submission with enhanced feedback
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        if (validateEmail(email)) {
            // Create a success message element
            const successMessage = document.createElement('div');
            successMessage.className = 'newsletter-success';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for subscribing!';

            // Replace the form with the success message
            newsletterForm.style.display = 'none';
            newsletterForm.parentNode.appendChild(successMessage);

            // Reset form
            newsletterForm.reset();
        } else {
            // Create or update error message
            let errorMessage = newsletterForm.querySelector('.newsletter-error');
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'newsletter-error';
                newsletterForm.appendChild(errorMessage);
            }
            errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address.';

            // Shake the input
            const input = newsletterForm.querySelector('input');
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
    });
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// GSAP animations for enhanced elements
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined') {
        // Animate the hero badge
        gsap.from('.hero-badge', {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        // Animate the floating elements
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((el, index) => {
            gsap.to(el, {
                y: '-20',
                duration: 2 + index * 0.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        });
    }
});

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Handle user authentication state
async function checkAuthState() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        const authLinks = document.querySelectorAll('.login-btn, .signup-btn');
        const userSection = document.querySelector('.user-section');
        const getStartedBtn = document.querySelector('.cta-primary');

        if (user) {
            // User is logged in
            // Hide login/signup buttons and show user section
            authLinks.forEach(link => link.style.display = 'none');

            if (userSection) {
                userSection.style.display = 'flex';

                // Update profile image and name
                const profileImage = document.getElementById('profileImage');
                const profileName = document.getElementById('profileName');

                if (profileImage) {
                    if (user.user_metadata?.avatar_url) {
                        profileImage.src = user.user_metadata.avatar_url;
                    } else {
                        profileImage.src = 'https://via.placeholder.com/32';
                    }
                }

                if (profileName) {
                    // Display name based on login type
                    if (user.app_metadata?.provider === 'google') {
                        // For Google login, use the name from user_metadata
                        profileName.textContent = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
                    } else if (user.user_metadata?.username) {
                        // For username signup
                        profileName.textContent = user.user_metadata.username;
                    } else if (user.user_metadata?.full_name) {
                        // Fallback to full_name if available
                        profileName.textContent = user.user_metadata.full_name;
                    } else {
                        // Last resort, use email but hide the domain part
                        const emailName = user.email.split('@')[0];
                        profileName.textContent = emailName;
                    }
                }
            }

            // Update "Get Started" button to redirect to dashboard
            if (getStartedBtn) {
                getStartedBtn.href = 'dashboard.html';
            }
        } else {
            // User is not logged in
            // Show login/signup buttons and hide user section
            authLinks.forEach(link => link.style.display = 'inline-block');

            if (userSection) {
                userSection.style.display = 'none';
            }

            // Update "Get Started" button to redirect to login
            if (getStartedBtn) {
                getStartedBtn.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Error checking auth state:', error.message);
    }
}

// Check auth state on page load
document.addEventListener('DOMContentLoaded', checkAuthState);

// Handle logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                window.location.href = '/';
            } catch (error) {
                console.error('Error signing out:', error.message);
            }
        });
    }
});