import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Toast notification helper
function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#10B981' : '#EF4444',
    }).showToast();
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    const indicator = document.querySelector('.password-strength');
    if (!indicator) return;

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#10b981'];
    const widths = ['25%', '50%', '75%', '100%'];
    
    indicator.style.setProperty('--strength-width', widths[strength - 1] || '0%');
    indicator.style.setProperty('--strength-color', colors[strength - 1] || '#ef4444');
}

// Handle form submission
async function handleSubmit(event, isLogin) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
        const { data, error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    data: {
                        username: form.username?.value
                    }
                }
            });

        if (error) throw error;

        showToast(isLogin ? 'Login successful!' : 'Account created successfully!');
        
        if (isLogin) {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = '/dashboard.html';
        } else {
            window.location.href = '/login.html';
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Handle Google authentication
async function handleGoogleAuth() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://umnmtmsvdnwbpdoniibo.supabase.co/auth/v1/callback'
            }
        });

        if (error) throw error;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Initialize page functionality
function initializePage() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const googleButtons = document.querySelectorAll('#googleLogin, #googleSignup');
    const passwordToggles = document.querySelectorAll('.toggle-password');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', e => handleSubmit(e, true));
    }
    if (signupForm) {
        signupForm.addEventListener('submit', e => handleSubmit(e, false));
        const passwordInput = signupForm.querySelector('#password');
        if (passwordInput) {
            passwordInput.addEventListener('input', e => updatePasswordStrength(e.target.value));
        }
    }

    // Google authentication
    googleButtons.forEach(button => {
        button.addEventListener('click', handleGoogleAuth);
    });

    // Password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.querySelector('input');
            const icon = toggle.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Handle authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = '/dashboard.html';
    } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/';
    }
});