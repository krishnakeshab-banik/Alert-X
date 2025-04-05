// Animation for reveal elements
const revealElements = document.querySelectorAll('.reveal');
const fadeUpElements = document.querySelectorAll('.fade-up');

// Intersection Observer for reveal animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all reveal elements
revealElements.forEach(element => {
    revealObserver.observe(element);
});

// Intersection Observer for fade-up animations
const fadeUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            fadeUpObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all fade-up elements
fadeUpElements.forEach(element => {
    fadeUpObserver.observe(element);
});

// Staggered animation for team members
const teamMembers = document.querySelectorAll('.team-member');
teamMembers.forEach((member, index) => {
    member.style.animationDelay = `${0.2 * index}s`;
});

// Staggered animation for benefits
const benefits = document.querySelectorAll('.benefit');
benefits.forEach((benefit, index) => {
    benefit.style.animationDelay = `${0.15 * index}s`;
});

// 3D effect for leader cards
const leaderCards = document.querySelectorAll('.leader-card');
leaderCards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const mouseX = e.clientX - cardCenterX;
        const mouseY = e.clientY - cardCenterY;
        
        // Calculate rotation based on mouse position
        const rotateY = mouseX / 10;
        const rotateX = -mouseY / 10;
        
        // Apply the rotation
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        // Reset the rotation when mouse leaves
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// Parallax effect for team hero section
const teamHero = document.querySelector('.team-hero');
const heroPattern = document.querySelector('.team-hero-pattern');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    if (teamHero && heroPattern) {
        heroPattern.style.transform = `translateY(${scrollPosition * 0.2}px)`;
    }
});

// Hover effects for team members
teamMembers.forEach(member => {
    member.addEventListener('mouseenter', () => {
        const image = member.querySelector('.member-image img');
        image.style.transform = 'scale(1.1)';
    });
    
    member.addEventListener('mouseleave', () => {
        const image = member.querySelector('.member-image img');
        image.style.transform = 'scale(1)';
    });
});

// Framer Motion integration (if available)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.framerMotion !== 'undefined') {
        // Initialize Framer Motion animations
        const { motion, AnimatePresence } = window.framerMotion;
        
        // Apply Framer Motion animations to elements
        // This is a placeholder for actual Framer Motion implementation
        console.log('Framer Motion is available for enhanced animations');
    } else {
        console.log('Framer Motion not available, using CSS animations');
    }
    
    // Add text reveal animation with delay
    const textRevealElements = document.querySelectorAll('.text-reveal');
    textRevealElements.forEach((element, index) => {
        element.style.animationDelay = `${0.3 * index}s`;
    });
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});