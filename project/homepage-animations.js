// Additional animations for the homepage
document.addEventListener('DOMContentLoaded', () => {
  // Only run this code on the homepage
  if (!document.querySelector('.hero')) return;
  
  // Initialize floating elements
  initFloatingElements();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize hover effects
  initHoverEffects();
  
  // Initialize text scramble effect
  initTextScramble();
  
  // Initialize 3D tilt effect
  initTiltEffect();
});

// Create and animate floating elements
function initFloatingElements() {
  // Add floating security icons to the hero section
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  // Only add these elements if they don't already exist
  if (hero.querySelector('.floating-security-icons')) return;
  
  const floatingIcons = document.createElement('div');
  floatingIcons.className = 'floating-security-icons';
  
  // Add various security-related icons
  const icons = [
    'shield-alt', 'lock', 'user-shield', 'fingerprint', 
    'eye', 'camera', 'bell', 'wifi', 'server', 'database'
  ];
  
  icons.forEach((icon, index) => {
    const iconElement = document.createElement('div');
    iconElement.className = 'floating-icon';
    iconElement.innerHTML = `<i class="fas fa-${icon}"></i>`;
    
    // Set random positions and animation delays
    const size = Math.floor(Math.random() * 20) + 10; // 10-30px
    iconElement.style.width = `${size}px`;
    iconElement.style.height = `${size}px`;
    iconElement.style.fontSize = `${size * 0.6}px`;
    
    iconElement.style.left = `${Math.random() * 90}%`;
    iconElement.style.top = `${Math.random() * 80}%`;
    iconElement.style.animationDelay = `${Math.random() * 5}s`;
    iconElement.style.animationDuration = `${Math.random() * 10 + 10}s`; // 10-20s
    
    floatingIcons.appendChild(iconElement);
  });
  
  hero.appendChild(floatingIcons);
}

// Add scroll-triggered animations
function initScrollAnimations() {
  // Add reveal animations to sections as they come into view
  const sections = document.querySelectorAll('.features, .how-it-works, .testimonials, .cta-section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-revealed');
        
        // Add staggered animations to children
        const children = entry.target.querySelectorAll('.feature-card, .step-item, .testimonial, .cta-content');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('element-revealed');
          }, index * 150); // Stagger by 150ms
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2 // Trigger when 20% of the section is visible
  });
  
  sections.forEach(section => {
    observer.observe(section);
  });
}

// Add hover effects to interactive elements
function initHoverEffects() {
  // Add glow effect to CTA buttons
  const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
  
  ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.classList.add('button-glow');
    });
    
    button.addEventListener('mouseleave', () => {
      button.classList.remove('button-glow');
    });
  });
  
  // Add magnetic effect to feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 20; // Reduce movement amount
      const moveY = (y - centerY) / 20;
      
      card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${moveY * -1}deg) rotateY(${moveX}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Add text scramble effect to headings
function initTextScramble() {
  // Only apply to the first glitch element to avoid performance issues
  const glitchElement = document.querySelector('.glitch');
  if (!glitchElement) return;
  
  const originalText = glitchElement.textContent;
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  
  let interval = null;
  let frame = 0;
  let frameRate = 30;
  let complete = false;
  
  const randomChar = () => {
    return chars[Math.floor(Math.random() * chars.length)];
  };
  
  const update = () => {
    let output = '';
    const progress = frame / frameRate;
    
    if (progress >= 1) {
      complete = true;
      glitchElement.textContent = originalText;
      clearInterval(interval);
      
      // Restart the effect after a delay
      setTimeout(() => {
        complete = false;
        frame = 0;
        interval = setInterval(update, 50);
      }, 10000); // Restart every 10 seconds
      
      return;
    }
    
    for (let i = 0; i < originalText.length; i++) {
      const char = originalText[i];
      
      if (char === ' ') {
        output += ' ';
        continue;
      }
      
      // Determine if this character should be scrambled
      const charProgress = Math.random() * progress * 2;
      
      if (charProgress < 1) {
        output += randomChar();
      } else {
        output += char;
      }
    }
    
    glitchElement.textContent = output;
    frame++;
  };
  
  // Start the scramble effect when scrolled into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !interval) {
        interval = setInterval(update, 50);
      }
    });
  }, {
    threshold: 0.5
  });
  
  observer.observe(glitchElement);
}

// Add 3D tilt effect to elements
function initTiltEffect() {
  const tiltElements = document.querySelectorAll('.hero-badge, .video-placeholder, .testimonial-author img');
  
  tiltElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 10;
      const moveY = (y - centerY) / 10;
      
      element.style.transform = `perspective(1000px) rotateX(${moveY * -1}deg) rotateY(${moveX}deg) scale3d(1.05, 1.05, 1.05)`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
    });
  });
}