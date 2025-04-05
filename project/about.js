// Animation for reveal elements
const revealElements = document.querySelectorAll('.reveal');
const popInElements = document.querySelectorAll('.pop-in');
const fadeInElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

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

// Staggered animation for value cards
const valueCards = document.querySelectorAll('.value-card');
valueCards.forEach((card, index) => {
    card.style.animationDelay = `${0.2 * index}s`;
});

// Staggered animation for tech items
const techItems = document.querySelectorAll('.tech-item');
techItems.forEach((item, index) => {
    item.style.animationDelay = `${0.3 * index}s`;
});

// Staggered animation for partners
const partners = document.querySelectorAll('.partner');
partners.forEach((partner, index) => {
    partner.style.animationDelay = `${0.15 * index}s`;
});

// Parallax effect for hero section
const aboutHero = document.querySelector('.about-hero');
const heroContent = document.querySelector('.about-hero-content');
const heroImage = document.querySelector('.about-hero-image');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    if (aboutHero) {
        const parallaxOffset = scrollPosition * 0.4;
        heroImage.style.transform = `translateY(${parallaxOffset}px)`;
        heroContent.style.transform = `translateY(${parallaxOffset * 0.2}px)`;
    }
});

// Hover effects for tech items
techItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        const icon = item.querySelector('.tech-icon i');
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        icon.style.transition = 'transform 0.3s ease';
    });
    
    item.addEventListener('mouseleave', () => {
        const icon = item.querySelector('.tech-icon i');
        icon.style.transform = 'scale(1) rotate(0deg)';
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