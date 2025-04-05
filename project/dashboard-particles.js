// Dashboard particles.js initialization
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize particles on the dashboard page
  if (!document.querySelector('.dashboard-container')) return;
  
  // Create particles container if it doesn't exist
  if (!document.getElementById('dashboard-particles-js')) {
    const particlesContainer = document.createElement('div');
    particlesContainer.id = 'dashboard-particles-js';
    
    // Insert the particles container as the first child of dashboard-container
    const dashboardContainer = document.querySelector('.dashboard-container');
    dashboardContainer.insertBefore(particlesContainer, dashboardContainer.firstChild);
  }
  
  // Initialize particles
  if (typeof particlesJS !== 'undefined') {
    particlesJS('dashboard-particles-js', {
      "particles": {
        "number": {
          "value": 80,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": ["#646cff", "#4b51c6", "#10b981"]
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
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 2,
            "size_min": 0.1,
            "sync": false
          }
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
          "bounce": false,
          "attract": {
            "enable": true,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "grab"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 140,
            "line_linked": {
              "opacity": 0.8
            }
          },
          "bubble": {
            "distance": 200,
            "size": 6,
            "duration": 2,
            "opacity": 0.8,
            "speed": 3
          },
          "repulse": {
            "distance": 150,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });
    
    // Add cursor tracking for better interactivity
    document.addEventListener('mousemove', (e) => {
      if (window.pJSDom && window.pJSDom.length > 0) {
        // Find the dashboard particles instance
        const dashboardParticlesInstance = window.pJSDom.find(dom => 
          dom.pJS.canvas.el.id === 'dashboard-particles-js'
        );
        
        if (dashboardParticlesInstance && dashboardParticlesInstance.pJS && dashboardParticlesInstance.pJS.interactivity) {
          dashboardParticlesInstance.pJS.interactivity.mouse.pos_x = e.clientX;
          dashboardParticlesInstance.pJS.interactivity.mouse.pos_y = e.clientY;
        }
      }
    });
  }
});