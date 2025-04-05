// Framer Motion Integration for Alert X
// This script provides animation utilities using Framer Motion

// Initialize Framer Motion when available
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.framerMotion !== 'undefined') {
        console.log('Framer Motion initialized for enhanced animations');
        initFramerMotion();
    } else {
        console.log('Framer Motion not available, using CSS animations');
        // Load Framer Motion dynamically if not already loaded
        loadFramerMotion();
    }
});

// Dynamically load Framer Motion if not already available
function loadFramerMotion() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/framer-motion/dist/framer-motion.js';
    script.onload = function() {
        console.log('Framer Motion loaded dynamically');
        initFramerMotion();
    };
    script.onerror = function() {
        console.warn('Failed to load Framer Motion, falling back to CSS animations');
    };
    document.head.appendChild(script);
}

// Initialize Framer Motion animations
function initFramerMotion() {
    const { motion, AnimatePresence } = window.framerMotion;
    
    // Apply animations to elements
    applyEntranceAnimations();
    applyHoverAnimations();
    applyScrollAnimations();
    setupCustomAnimations();
}

// Apply entrance animations to elements
function applyEntranceAnimations() {
    // Header animations
    animateElement('.live-finder-header h1', {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' }
    });
    
    animateElement('.live-finder-header p', {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.2, ease: 'easeOut' }
    });
    
    // Control panel animations
    animateElement('.control-panel', {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.4, ease: 'easeOut' }
    });
    
    // Tool buttons staggered animation
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach((button, index) => {
        animateElement(button, {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.6 + (index * 0.1), ease: 'easeOut' }
        });
    });
    
    // Status indicators staggered animation
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach((item, index) => {
        animateElement(item, {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.5, delay: 0.6 + (index * 0.1), ease: 'easeOut' }
        });
    });
    
    // Main display animation
    animateElement('.main-display', {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.8, ease: 'easeOut' }
    });
}

// Apply hover animations to interactive elements
function applyHoverAnimations() {
    // Tool buttons hover effect
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            animateElement(button, {
                animate: { y: -5, boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)' },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
            
            const icon = button.querySelector('i');
            if (icon) {
                animateElement(icon, {
                    animate: { scale: 1.2 },
                    transition: { duration: 0.3, ease: 'easeOut' }
                });
            }
        });
        
        button.addEventListener('mouseleave', () => {
            animateElement(button, {
                animate: { y: 0, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
            
            const icon = button.querySelector('i');
            if (icon) {
                animateElement(icon, {
                    animate: { scale: 1 },
                    transition: { duration: 0.3, ease: 'easeOut' }
                });
            }
        });
    });
    
    // Status items hover effect
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            animateElement(item, {
                animate: { y: -3, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
        });
        
        item.addEventListener('mouseleave', () => {
            animateElement(item, {
                animate: { y: 0, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
        });
    });
    
    // Camera cells hover effect
    const cameraCells = document.querySelectorAll('.camera-cell');
    cameraCells.forEach(cell => {
        cell.addEventListener('mouseenter', () => {
            animateElement(cell, {
                animate: { scale: 1.02, zIndex: 2 },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
            
            const overlay = cell.querySelector('.camera-overlay');
            if (overlay) {
                animateElement(overlay, {
                    animate: { opacity: 1 },
                    transition: { duration: 0.3, ease: 'easeOut' }
                });
            }
            
            const info = cell.querySelector('.camera-info');
            if (info) {
                animateElement(info, {
                    animate: { y: 0, opacity: 1 },
                    transition: { duration: 0.3, ease: 'easeOut' }
                });
            }
        });
        
        cell.addEventListener('mouseleave', () => {
            animateElement(cell, {
                animate: { scale: 1, zIndex: 1 },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
            
            const overlay = cell.querySelector('.camera-overlay');
            if (overlay) {
                animateElement(overlay, {
                    animate: { opacity: 0 },
                    transition: { duration: 0.3, ease: 'easeOut' }
                });
            }
            
            const info = cell.querySelector('.camera-info');
            if (info) {
                animateElement(info, {
                    animate: { y: 10, opacity: 0 },
                    transition: { duration: 0.3, ease: 'easeOut' }
                });
            }
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            animateElement(button, {
                animate: { y: -2, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
        });
        
        button.addEventListener('mouseleave', () => {
            animateElement(button, {
                animate: { y: 0, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' },
                transition: { duration: 0.3, ease: 'easeOut' }
            });
        });
    });
}

// Apply scroll-based animations
function applyScrollAnimations() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Apply different animations based on data attributes
                if (element.classList.contains('fade-in')) {
                    animateElement(element, {
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.6, ease: 'easeOut' }
                    });
                } else if (element.classList.contains('slide-in')) {
                    animateElement(element, {
                        animate: { opacity: 1, x: 0 },
                        transition: { duration: 0.6, ease: 'easeOut' }
                    });
                } else if (element.classList.contains('scale-in')) {
                    animateElement(element, {
                        animate: { opacity: 1, scale: 1 },
                        transition: { duration: 0.6, ease: 'easeOut' }
                    });
                } else {
                    // Default animation
                    animateElement(element, {
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.6, ease: 'easeOut' }
                    });
                }
                
                // Unobserve after animation
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-in, .scale-in, .animate-on-scroll').forEach(element => {
        // Set initial state
        element.style.opacity = '0';
        
        if (element.classList.contains('fade-in')) {
            element.style.transform = 'translateY(20px)';
        } else if (element.classList.contains('slide-in')) {
            element.style.transform = 'translateX(-20px)';
        } else if (element.classList.contains('scale-in')) {
            element.style.transform = 'scale(0.9)';
        } else {
            element.style.transform = 'translateY(20px)';
        }
        
        observer.observe(element);
    });
}

// Set up custom animations for specific interactions
function setupCustomAnimations() {
    // Detection panel animation
    const detectionPanelBtns = document.querySelectorAll('#person-search-btn, #vehicle-search-btn, #incident-detection-btn, #traffic-analysis-btn');
    const detectionPanel = document.getElementById('detection-panel');
    
    detectionPanelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (detectionPanel) {
                animateElement(detectionPanel, {
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
                });
            }
        });
    });
    
    // Close panel animation
    const closePanelBtn = document.querySelector('.close-panel-btn');
    if (closePanelBtn && detectionPanel) {
        closePanelBtn.addEventListener('click', () => {
            animateElement(detectionPanel, {
                animate: { opacity: 0, x: 30 },
                transition: { duration: 0.3, ease: 'easeIn' }
            });
        });
    }
    
    // Add camera button animation
    const addCameraBtn = document.getElementById('add-camera-btn');
    if (addCameraBtn) {
        addCameraBtn.addEventListener('click', () => {
            animateElement(addCameraBtn, {
                animate: { scale: 0.95 },
                transition: { duration: 0.1 }
            });
            
            setTimeout(() => {
                animateElement(addCameraBtn, {
                    animate: { scale: 1 },
                    transition: { duration: 0.2, ease: 'easeOut' }
                });
            }, 100);
        });
    }
}

// Helper function to apply Framer Motion animations to DOM elements
function animateElement(element, animation) {
    if (!window.framerMotion) return;
    
    const { animate } = window.framerMotion;
    
    // Handle both selector strings and direct element references
    const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!targetElement) return;
    
    // Apply the animation
    animate(targetElement, 
        animation.animate, 
        { 
            initial: animation.initial,
            transition: animation.transition
        }
    );
}

// Export functions for use in other scripts
window.framerMotionIntegration = {
    animateElement,
    applyEntranceAnimations,
    applyHoverAnimations,
    applyScrollAnimations
};