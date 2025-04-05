document.addEventListener('DOMContentLoaded', function() {
    // Pricing toggle functionality
    const billingToggle = document.getElementById('billing-toggle');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    
    billingToggle.addEventListener('change', function() {
        toggleLabels.forEach((label, index) => {
            if (index === Number(this.checked)) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
        
        if (this.checked) {
            // Yearly pricing
            monthlyPrices.forEach(price => {
                price.style.display = 'none';
            });
            yearlyPrices.forEach(price => {
                price.style.display = 'inline';
            });
        } else {
            // Monthly pricing
            monthlyPrices.forEach(price => {
                price.style.display = 'inline';
            });
            yearlyPrices.forEach(price => {
                price.style.display = 'none';
            });
        }
    });
    
    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // Highlight the plan cards on hover
    const planCards = document.querySelectorAll('.plan-card');
    
    planCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            planCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.opacity = '0.7';
                }
            });
        });
        
        card.addEventListener('mouseleave', () => {
            planCards.forEach(otherCard => {
                otherCard.style.opacity = '1';
            });
        });
    });
});