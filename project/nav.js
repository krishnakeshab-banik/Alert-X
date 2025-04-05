// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

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