// Use the global supabase object
const supabaseUrl = 'https://umnmtmsvdnwbpdoniibo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm10bXN2ZG53YnBkb25paWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQwODMsImV4cCI6MjA1ODg1MDA4M30.CKZTATC52JZWaeI0wIY2qnre0wyvxAEt6n8hNZeePwk';

// This will be initialized when the script loads
let supabase;
let currentUser;
let userMetadata = {};
let userSettings = {
    theme: 'light',
    accentColor: 'blue',
    notifications: {
        securityEmails: true,
        detectionEmails: true,
        updateEmails: false,
        marketingEmails: false,
        browserNotifications: false,
        detectionBrowser: false
    },
    privacy: {
        dataCollection: true,
        videoStorage: true
    }
};

// Initialize the settings page
async function initializeSettings() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;
        userMetadata = user.user_metadata || {};
        
        // Load user settings from metadata if available
        if (userMetadata.settings) {
            userSettings = { ...userSettings, ...userMetadata.settings };
        }
        
        // Update profile information
        updateProfileInfo(user);
        
        // Initialize event listeners
        setupEventListeners();
        
        // Initialize animations
        initializeAnimations();
        
        // Apply saved settings
        applyUserSettings();
        
    } catch (error) {
        console.error('Error initializing settings:', error.message);
        showToast(error.message, 'error');
        window.location.href = 'login.html';
    }
}

// Update profile information
function updateProfileInfo(user) {
    // Update navbar profile
    const profileImage = document.getElementById('profileImage');
    const profileName = document.getElementById('profileName');

    if (user.user_metadata?.avatar_url) {
        profileImage.src = user.user_metadata.avatar_url;
    } else {
        profileImage.src = 'https://via.placeholder.com/32';
    }

    if (user.user_metadata?.username) {
        profileName.textContent = user.user_metadata.username;
    } else {
        profileName.textContent = user.email;
    }

    // Update account settings form
    document.getElementById('settingsFullName').value = user.user_metadata?.full_name || '';
    document.getElementById('settingsUsername').value = user.user_metadata?.username || user.email.split('@')[0];
    document.getElementById('settingsEmail').value = user.email;

    // Update Google link status if available
    if (user.app_metadata?.providers && user.app_metadata.providers.includes('google')) {
        document.getElementById('googleLinkStatus').textContent = 'Connected';
        document.getElementById('googleLinkBtn').textContent = 'Disconnect';
    }

    // Update current session info
    document.getElementById('currentSessionTime').textContent = 'Active now';
    
    // Try to get location from browser
    try {
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                if (data.city && data.country_name) {
                    document.getElementById('currentSessionLocation').textContent = `${data.city}, ${data.country_name}`;
                }
            })
            .catch(error => {
                console.error('Error fetching location:', error);
            });
    } catch (error) {
        console.error('Error fetching location:', error);
    }
}

// Apply user settings
function applyUserSettings() {
    // Apply theme
    document.querySelector(`input[name="theme"][value="${userSettings.theme}"]`).checked = true;
    
    // Apply accent color
    document.querySelector(`input[name="accentColor"][value="${userSettings.accentColor}"]`).checked = true;
    
    // Apply notification settings
    document.getElementById('securityEmailsToggle').checked = userSettings.notifications.securityEmails;
    document.getElementById('detectionEmailsToggle').checked = userSettings.notifications.detectionEmails;
    document.getElementById('updateEmailsToggle').checked = userSettings.notifications.updateEmails;
    document.getElementById('marketingEmailsToggle').checked = userSettings.notifications.marketingEmails;
    document.getElementById('browserNotificationsToggle').checked = userSettings.notifications.browserNotifications;
    document.getElementById('detectionBrowserToggle').checked = userSettings.notifications.detectionBrowser;
    document.getElementById('detectionBrowserToggle').disabled = !userSettings.notifications.browserNotifications;
    
    // Apply privacy settings
    document.getElementById('dataCollectionToggle').checked = userSettings.privacy.dataCollection;
    document.getElementById('videoStorageToggle').checked = userSettings.privacy.videoStorage;
    
    // Apply theme and accent color to the page
    applyTheme(userSettings.theme);
    applyAccentColor(userSettings.accentColor);
}

// Set up event listeners
function setupEventListeners() {
    // Section navigation
    const navItems = document.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Handle hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();

    // Form submissions
    document.getElementById('personalInfoForm').addEventListener('submit', handlePersonalInfoSubmit);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordSubmit);

    // Theme selection
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.addEventListener('change', () => {
            const theme = input.value;
            userSettings.theme = theme;
            applyTheme(theme);
            saveUserSettings();
        });
    });

    // Accent color selection
    document.querySelectorAll('input[name="accentColor"]').forEach(input => {
        input.addEventListener('change', () => {
            const color = input.value;
            userSettings.accentColor = color;
            applyAccentColor(color);
            saveUserSettings();
        });
    });

    // Notification toggles
    document.getElementById('securityEmailsToggle').addEventListener('change', (e) => {
        userSettings.notifications.securityEmails = e.target.checked;
        saveUserSettings();
    });
    
    document.getElementById('detectionEmailsToggle').addEventListener('change', (e) => {
        userSettings.notifications.detectionEmails = e.target.checked;
        saveUserSettings();
    });
    
    document.getElementById('updateEmailsToggle').addEventListener('change', (e) => {
        userSettings.notifications.updateEmails = e.target.checked;
        saveUserSettings();
    });
    
    document.getElementById('marketingEmailsToggle').addEventListener('change', (e) => {
        userSettings.notifications.marketingEmails = e.target.checked;
        saveUserSettings();
    });
    
    document.getElementById('browserNotificationsToggle').addEventListener('change', (e) => {
        userSettings.notifications.browserNotifications = e.target.checked;
        document.getElementById('detectionBrowserToggle').disabled = !e.target.checked;
        
        if (e.target.checked) {
            // Request browser notification permission
            Notification.requestPermission().then(permission => {
                if (permission !== 'granted') {
                    showToast('Notification permission denied', 'error');
                    e.target.checked = false;
                    userSettings.notifications.browserNotifications = false;
                }
            });
        }
        
        saveUserSettings();
    });
    
    document.getElementById('detectionBrowserToggle').addEventListener('change', (e) => {
        userSettings.notifications.detectionBrowser = e.target.checked;
        saveUserSettings();
    });

    // Privacy toggles
    document.getElementById('dataCollectionToggle').addEventListener('change', (e) => {
        userSettings.privacy.dataCollection = e.target.checked;
        saveUserSettings();
    });
    
    document.getElementById('videoStorageToggle').addEventListener('change', (e) => {
        userSettings.privacy.videoStorage = e.target.checked;
        saveUserSettings();
    });

    // Password strength meter
    const newPasswordInput = document.getElementById('settingsNewPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', e => updatePasswordStrength(e.target.value));
    }

    // Delete account button
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        document.getElementById('deleteAccountModal').classList.add('active');
    });

    // 2FA setup button
    document.getElementById('setup2FABtn').addEventListener('click', () => {
        document.getElementById('twoFactorModal').classList.add('active');
    });

    // Close modals
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(element => {
        element.addEventListener('click', closeAllModals);
    });

    // 2FA setup steps
    document.querySelector('.next-step-btn').addEventListener('click', () => {
        goToStep(2);
    });
    
    document.querySelector('.prev-step-btn').addEventListener('click', () => {
        goToStep(1);
    });
    
    document.getElementById('verifyCodeBtn').addEventListener('click', () => {
        // Simulate successful verification
        goToStep(3);
    });

    // Delete account form
    document.getElementById('deleteAccountForm').addEventListener('submit', handleDeleteAccount);

    // Google link button
    document.getElementById('googleLinkBtn').addEventListener('click', handleGoogleLink);

    // Other buttons with coming soon features
    document.getElementById('downloadDataBtn').addEventListener('click', () => showToast('Data download feature coming soon!', 'info'));
    document.getElementById('logoutAllBtn').addEventListener('click', () => showToast('Sign out of all sessions feature coming soon!', 'info'));
    document.getElementById('upgradePlanBtn').addEventListener('click', () => showToast('Plan upgrade feature coming soon!', 'info'));
    document.getElementById('addPaymentBtn').addEventListener('click', () => showToast('Payment method feature coming soon!', 'info'));
    document.getElementById('generateApiKeyBtn').addEventListener('click', () => showToast('API key generation feature coming soon!', 'info'));
    document.getElementById('addWebhookBtn').addEventListener('click', () => showToast('Webhook configuration feature coming soon!', 'info'));
    document.getElementById('downloadCodesBtn').addEventListener('click', () => showToast('Recovery codes download feature coming soon!', 'info'));

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
}

// Handle hash change
function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        switchSection(hash);
    } else if (document.querySelector('.settings-section')) {
        // Default to account section
        switchSection('account');
    }
}

// Switch between sections
function switchSection(sectionId) {
    // Update navigation
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.settings-nav-item[data-section="${sectionId}"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update URL hash without scrolling
    const scrollPosition = window.scrollY;
    window.location.hash = sectionId;
    window.scrollTo(0, scrollPosition);
    
    // Animate the section
    animateSection(sectionId);
}

// Animate section content
function animateSection(sectionId) {
    const section = document.getElementById(sectionId);
    
    gsap.from(section.querySelectorAll('.settings-card'), {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all"
    });
}

// Go to 2FA setup step
function goToStep(step) {
    document.querySelectorAll('.setup-step').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelector(`.setup-step[data-step="${step}"]`).classList.add('active');
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Handle personal info form submission
async function handlePersonalInfoSubmit(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('settingsFullName').value;
    const username = document.getElementById('settingsUsername').value;
    
    try {
        showToast('Updating profile information...', 'info');
        
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                username: username
            }
        });
        
        if (error) throw error;
        
        // Refresh user data
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) throw getUserError;
        
        // Update UI
        updateProfileInfo(user);
        
        showToast('Profile information updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile information. Please try again.', 'error');
    }
}

// Handle password form submission
async function handlePasswordSubmit(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('settingsCurrentPassword').value;
    const newPassword = document.getElementById('settingsNewPassword').value;
    const confirmPassword = document.getElementById('settingsConfirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    try {
        showToast('Updating password...', 'info');
        
        // First sign in with the current password to verify it
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });
        
        if (signInError) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        // Update the password
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        
        showToast('Password updated successfully!', 'success');
        
        // Clear the form
        document.getElementById('passwordForm').reset();
    } catch (error) {
        console.error('Error updating password:', error);
        showToast('Failed to update password. Please try again.', 'error');
    }
}

// Handle delete account
async function handleDeleteAccount(event) {
    event.preventDefault();
    
    const password = document.getElementById('deleteConfirmPassword').value;
    const reason = document.getElementById('deleteReason').value;
    
    try {
        showToast('Verifying password...', 'info');
        
        // First sign in with the password to verify it
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: password
        });
        
        if (signInError) {
            showToast('Password is incorrect', 'error');
            return;
        }
        
        showToast('Deleting account...', 'info');
        
        // Store the reason if provided
        if (reason) {
            // In a real app, you might want to store this in a separate table
            console.log('Deletion reason:', reason);
        }
        
        // Delete the user
        const { error } = await supabase.auth.admin.deleteUser(currentUser.id);
        
        if (error) throw error;
        
        // Sign out
        await supabase.auth.signOut();
        
        // Redirect to home page
        window.location.href = 'index.html?deleted=true';
    } catch (error) {
        console.error('Error deleting account:', error);
        showToast('Failed to delete account. Please try again.', 'error');
    }
}

// Handle Google link/unlink
async function handleGoogleLink() {
    const isLinked = document.getElementById('googleLinkStatus').textContent === 'Connected';
    
    if (isLinked) {
        // Unlink Google account
        try {
            showToast('Unlinking Google account...', 'info');
            
            // In a real app, you would call an API to unlink the account
            // For this demo, we'll just simulate it
            setTimeout(() => {
                document.getElementById('googleLinkStatus').textContent = 'Not connected';
                document.getElementById('googleLinkBtn').textContent = 'Connect';
                showToast('Google account unlinked successfully!', 'success');
            }, 1000);
        } catch (error) {
            console.error('Error unlinking Google account:', error);
            showToast('Failed to unlink Google account. Please try again.', 'error');
        }
    } else {
        // Link Google account
        try {
            showToast('Linking Google account...', 'info');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/auth/callback.html'
                }
            });
            
            if (error) throw error;
        } catch (error) {
            console.error('Error linking Google account:', error);
            showToast('Failed to link Google account. Please try again.', 'error');
        }
    }
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const indicator = document.querySelector('.password-strength');
    let strength = 0;
    
    // Check password length
    if (password.length >= 8) strength += 1;
    
    // Check for mixed case
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    
    // Check for numbers
    if (password.match(/\d/)) strength += 1;
    
    // Check for special characters
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    
    // Update the indicator
    const widths = ['25%', '50%', '75%', '100%'];
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#10B981'];
    
    indicator.style.setProperty('--strength-width', widths[strength - 1] || '0%');
    indicator.style.setProperty('--strength-color', colors[strength - 1] || '#EF4444');
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    } else if (theme === 'light') {
        document.documentElement.classList.remove('dark-mode');
    } else if (theme === 'system') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }
}

// Apply accent color
function applyAccentColor(color) {
    let primaryColor, secondaryColor;
    
    switch (color) {
        case 'blue':
            primaryColor = '#646cff';
            secondaryColor = '#535bf2';
            break;
        case 'purple':
            primaryColor = '#9333ea';
            secondaryColor = '#7e22ce';
            break;
        case 'green':
            primaryColor = '#10b981';
            secondaryColor = '#059669';
            break;
        case 'red':
            primaryColor = '#ef4444';
            secondaryColor = '#dc2626';
            break;
        case 'orange':
            primaryColor = '#f59e0b';
            secondaryColor = '#d97706';
            break;
        default:
            primaryColor = '#646cff';
            secondaryColor = '#535bf2';
    }
    
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
}

// Save user settings to Supabase
async function saveUserSettings() {
    try {
        const { error } = await supabase.auth.updateUser({
            data: {
                settings: userSettings
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Failed to save settings. Please try again.', 'error');
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Animate logout
        gsap.to('.settings-container', {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                window.location.href = 'index.html';
            }
        });
    } catch (error) {
        console.error('Error signing out:', error.message);
        showToast('Error signing out. Please try again.', 'error');
    }
}

// Initialize animations
function initializeAnimations() {
    // Animate settings cards
    gsap.from('.settings-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });
}

// Toast notification helper
function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
        className: 'toast-notification',
        stopOnFocus: true,
    }).showToast();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase client
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        await initializeSettings();
    } else {
        console.error('Supabase client not available');
        alert('Error: Authentication service not available. Please try again later.');
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});