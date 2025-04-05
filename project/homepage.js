// Homepage-specific enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Only run this code on the homepage
  if (!document.querySelector('.hero')) return;
  
  // Initialize preloader
  initPreloader();
  
  // Initialize custom cursor
  initCustomCursor();
  
  // Initialize particles.js
  initParticles();
  
  // Initialize scroll indicator
  initScrollIndicator();
  
  // Initialize back to top button
  initBackToTop();
  
  // Initialize toast notifications
  initToastSystem();
  
  // Initialize video placeholders
  initVideoPlaceholders();
  
  // Add glitch effect to specific elements
  initGlitchEffect();
});

// Preloader functionality
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  
  // Hide preloader after content loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      // Show toast notification after preloader disappears
      showToast('Welcome to Alert X', 'Discover the future of AI-powered security', 'info');
    }, 1000);
  });
}

// Custom cursor functionality
function initCustomCursor() {
  // Don't initialize on touch devices
  if ('ontouchstart' in window) return;
  
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;
  
  // Update cursor position
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
  
  // Add hover effect on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .feature-card, .testimonial, .video-placeholder, input, .cta-content');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
    });
  });
  
  // Add click effect
  document.addEventListener('mousedown', () => {
    cursor.classList.add('click');
  });
  
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('click');
  });
}

// Particles.js initialization
function initParticles() {
  const particlesContainer = document.getElementById('particles-js');
  if (!particlesContainer || typeof particlesJS === 'undefined') return;

  // Create additional particle containers for different sections
  createSectionParticles();

  // Initialize main hero particles
  particlesJS('particles-js', {
    "particles": {
      "number": {
        "value": 120,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": ["#646cff", "#535bf2", "#9089fc", "#ff6b6b", "#10b981"]
      },
      "shape": {
        "type": ["circle", "triangle", "polygon"],
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 6
        }
      },
      "opacity": {
        "value": 0.6,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 1.5,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 4,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 3,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#646cff",
        "opacity": 0.4,
        "width": 1.2
      },
      "move": {
        "enable": true,
        "speed": 3.5,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "bounce",
        "bounce": true,
        "attract": {
          "enable": true,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "window",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "repulse"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 200,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 250,
          "size": 8,
          "duration": 2,
          "opacity": 0.8,
          "speed": 3
        },
        "repulse": {
          "distance": 180,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 8
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true
  });

  // Add dynamic interaction modes
  initDynamicInteraction();

  // Add parallax effect to particles
  initParticlesParallax();
}

// Create additional particle containers for different sections
function createSectionParticles() {
  // Only create these elements if they don't already exist
  if (!document.getElementById('features-particles')) {
    // Create particles for features section
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
      const featuresParticles = document.createElement('div');
      featuresParticles.id = 'features-particles';
      featuresParticles.className = 'section-particles';
      featuresSection.prepend(featuresParticles);

      // Initialize features particles with different settings
      setTimeout(() => {
        if (typeof particlesJS !== 'undefined') {
          particlesJS('features-particles', {
            "particles": {
              "number": {
                "value": 30,
                "density": {
                  "enable": true,
                  "value_area": 800
                }
              },
              "color": {
                "value": "#646cff"
              },
              "shape": {
                "type": "circle",
                "stroke": {
                  "width": 0,
                  "color": "#000000"
                }
              },
              "opacity": {
                "value": 0.3,
                "random": true
              },
              "size": {
                "value": 5,
                "random": true
              },
              "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#646cff",
                "opacity": 0.2,
                "width": 1
              },
              "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false
              }
            },
            "interactivity": {
              "detect_on": "canvas",
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "bubble"
                },
                "onclick": {
                  "enable": true,
                  "mode": "push"
                },
                "resize": true
              },
              "modes": {
                "bubble": {
                  "distance": 200,
                  "size": 8,
                  "duration": 2,
                  "opacity": 0.8,
                  "speed": 3
                },
                "push": {
                  "particles_nb": 4
                }
              }
            },
            "retina_detect": true
          });
        }
      }, 500);
    }
  }

  if (!document.getElementById('testimonials-particles')) {
    // Create particles for testimonials section
    const testimonialsSection = document.querySelector('.testimonials');
    if (testimonialsSection) {
      const testimonialsParticles = document.createElement('div');
      testimonialsParticles.id = 'testimonials-particles';
      testimonialsParticles.className = 'section-particles';
      testimonialsSection.prepend(testimonialsParticles);

      // Initialize testimonials particles with different settings
      setTimeout(() => {
        if (typeof particlesJS !== 'undefined') {
          particlesJS('testimonials-particles', {
            "particles": {
              "number": {
                "value": 40,
                "density": {
                  "enable": true,
                  "value_area": 800
                }
              },
              "color": {
                "value": "#10b981"
              },
              "shape": {
                "type": "circle",
                "stroke": {
                  "width": 0,
                  "color": "#000000"
                }
              },
              "opacity": {
                "value": 0.2,
                "random": true
              },
              "size": {
                "value": 4,
                "random": true
              },
              "line_linked": {
                "enable": false
              },
              "move": {
                "enable": true,
                "speed": 1.5,
                "direction": "top",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false
              }
            },
            "interactivity": {
              "detect_on": "canvas",
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "connect"
                },
                "onclick": {
                  "enable": false
                },
                "resize": true
              },
              "modes": {
                "connect": {
                  "distance": 150,
                  "line_linked": {
                    "opacity": 0.2
                  },
                  "radius": 100
                }
              }
            },
            "retina_detect": true
          });
        }
      }, 500);
    }
  }

  if (!document.getElementById('cta-particles')) {
    // Create particles for CTA section
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
      const ctaParticles = document.createElement('div');
      ctaParticles.id = 'cta-particles';
      ctaParticles.className = 'section-particles';
      ctaSection.prepend(ctaParticles);

      // Initialize CTA particles with different settings
      setTimeout(() => {
        if (typeof particlesJS !== 'undefined') {
          particlesJS('cta-particles', {
            "particles": {
              "number": {
                "value": 60,
                "density": {
                  "enable": true,
                  "value_area": 800
                }
              },
              "color": {
                "value": "#ff6b6b"
              },
              "shape": {
                "type": "star",
                "stroke": {
                  "width": 0,
                  "color": "#000000"
                }
              },
              "opacity": {
                "value": 0.3,
                "random": true
              },
              "size": {
                "value": 4,
                "random": true
              },
              "line_linked": {
                "enable": false
              },
              "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false
              }
            },
            "interactivity": {
              "detect_on": "canvas",
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "repulse"
                },
                "onclick": {
                  "enable": true,
                  "mode": "bubble"
                },
                "resize": true
              },
              "modes": {
                "repulse": {
                  "distance": 100,
                  "duration": 0.4
                },
                "bubble": {
                  "distance": 200,
                  "size": 10,
                  "duration": 2,
                  "opacity": 0.8,
                  "speed": 3
                }
              }
            },
            "retina_detect": true
          });
        }
      }, 500);
    }
  }
}

// Add dynamic interaction modes to main particles
function initDynamicInteraction() {
  // Add a multi-mode interaction that switches between repulse and attract
  let currentMode = 'repulse';
  const modes = ['repulse', 'grab', 'bubble'];
  let modeIndex = 0;

  // Add event listener for cursor movement
  document.addEventListener('mousemove', (e) => {
    if (window.particlesJS && window.pJSDom) {
      // Update all particle systems with cursor position
      window.pJSDom.forEach(dom => {
        if (dom && dom.pJS && dom.pJS.interactivity) {
          dom.pJS.interactivity.mouse.pos_x = e.clientX;
          dom.pJS.interactivity.mouse.pos_y = e.clientY;
        }
      });
    }
  });

  // Toggle between different interaction modes periodically for main particles
  setInterval(() => {
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
      const pJS = window.pJSDom[0].pJS;

      modeIndex = (modeIndex + 1) % modes.length;
      currentMode = modes[modeIndex];

      if (pJS.interactivity && pJS.interactivity.events) {
        pJS.interactivity.events.onhover.mode = currentMode;

        // Adjust mode-specific settings
        if (currentMode === 'repulse') {
          pJS.interactivity.modes.repulse.distance = 180;
        } else if (currentMode === 'grab') {
          pJS.interactivity.modes.grab.distance = 200;
        } else if (currentMode === 'bubble') {
          pJS.interactivity.modes.bubble.size = 8;
        }
      }
    }
  }, 6000);
}

// Add parallax effect to particles based on mouse movement
function initParticlesParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
      const pJS = window.pJSDom[0].pJS;

      // Apply subtle parallax effect to particles
      pJS.particles.array.forEach((p, i) => {
        if (i % 3 === 0) { // Only affect every third particle for performance
          const parallaxFactor = 5;
          const offsetX = (mouseX - 0.5) * parallaxFactor;
          const offsetY = (mouseY - 0.5) * parallaxFactor;

          p.x += offsetX * 0.1;
          p.y += offsetY * 0.1;
        }
      });
    }
  });
}

// Scroll indicator functionality
function initScrollIndicator() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (!scrollIndicator) return;
  
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollIndicator.style.width = scrolled + '%';
  });
}

// Back to top button functionality
function initBackToTop() {
  const backToTopButton = document.querySelector('.back-to-top');
  if (!backToTopButton) return;
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });
  
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Toast notification system
function initToastSystem() {
  // Create toast container if it doesn't exist
  if (!document.querySelector('.toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

function showToast(title, message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) return;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  
  // Create toast content
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas fa-${icon}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close"><i class="fas fa-times"></i></button>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Show toast with a slight delay for animation
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  // Add close button functionality
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Video placeholders functionality
function initVideoPlaceholders() {
  const videoPlaceholders = document.querySelectorAll('.video-placeholder');
  if (videoPlaceholders.length === 0) return;
  
  // Create video modal if it doesn't exist
  if (!document.querySelector('.video-modal')) {
    const videoModal = document.createElement('div');
    videoModal.className = 'video-modal';
    videoModal.innerHTML = `
      <div class="video-modal-content">
        <button class="video-modal-close"><i class="fas fa-times"></i></button>
        <iframe frameborder="0" allowfullscreen></iframe>
      </div>
    `;
    document.body.appendChild(videoModal);
    
    // Add close functionality
    const closeButton = videoModal.querySelector('.video-modal-close');
    closeButton.addEventListener('click', () => {
      videoModal.classList.remove('visible');
      videoModal.querySelector('iframe').src = '';
    });
  }
  
  // Add click event to video placeholders
  videoPlaceholders.forEach(placeholder => {
    placeholder.addEventListener('click', () => {
      const videoId = placeholder.dataset.videoId;
      if (!videoId) return;
      
      const videoModal = document.querySelector('.video-modal');
      const iframe = videoModal.querySelector('iframe');
      
      // Set video source
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      
      // Show modal
      videoModal.classList.add('visible');
      
      // Show success toast
      showToast('Video Playing', 'Enjoy the demonstration of Alert X in action', 'info');
    });
  });
}

// Glitch effect for text
function initGlitchEffect() {
  const glitchElements = document.querySelectorAll('.glitch');
  
  glitchElements.forEach(element => {
    // Store the original text as a data attribute
    const text = element.textContent;
    element.setAttribute('data-text', text);
  });
}

// Countdown timer functionality
function initCountdownTimer() {
  const daysElement = document.getElementById('countdown-days');
  const hoursElement = document.getElementById('countdown-hours');
  const minutesElement = document.getElementById('countdown-minutes');
  const secondsElement = document.getElementById('countdown-seconds');

  if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return;

  // Set the end date to 30 days from now
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  function updateCountdown() {
    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) {
      // Countdown has ended
      daysElement.textContent = '00';
      hoursElement.textContent = '00';
      minutesElement.textContent = '00';
      secondsElement.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysElement.textContent = days < 10 ? `0${days}` : days;
    hoursElement.textContent = hours < 10 ? `0${hours}` : hours;
    minutesElement.textContent = minutes < 10 ? `0${minutes}` : minutes;
    secondsElement.textContent = seconds < 10 ? `0${seconds}` : seconds;
  }

  // Update the countdown every second
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', initCountdownTimer);

// Newsletter form enhancement
document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;

    if (validateEmail(email)) {
      // Show success toast
      showToast('Subscription Successful', 'Thank you for subscribing to our newsletter!', 'success');
      newsletterForm.reset();
    } else {
      // Show error toast
      showToast('Invalid Email', 'Please enter a valid email address', 'error');

      // Shake the input
      const input = newsletterForm.querySelector('input');
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});