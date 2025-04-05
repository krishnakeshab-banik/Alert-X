// Use the global supabase object
const supabaseUrl = 'https://umnmtmsvdnwbpdoniibo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm10bXN2ZG53YnBkb25paWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQwODMsImV4cCI6MjA1ODg1MDA4M30.CKZTATC52JZWaeI0wIY2qnre0wyvxAEt6n8hNZeePwk';

// This will be initialized when the script loads
let supabase;
let currentUser;
let userMetadata = {};

// Initialize the profile page
async function initializeProfile() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;
        userMetadata = user.user_metadata || {};
        
        // Update profile information
        updateProfileInfo(user);
        
        // Initialize event listeners
        setupEventListeners();
        
        // Initialize animations
        initializeAnimations();
        
    } catch (error) {
        console.error('Error initializing profile:', error.message);
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

    // Update profile page elements
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const profileFullName = document.getElementById('profileFullName');
    const profileEmail = document.getElementById('profileEmail');

    if (user.user_metadata?.avatar_url) {
        profileAvatarLarge.src = user.user_metadata.avatar_url;
    } else {
        profileAvatarLarge.src = 'https://via.placeholder.com/150';
    }

    if (user.user_metadata?.full_name) {
        profileFullName.textContent = user.user_metadata.full_name;
    } else if (user.user_metadata?.username) {
        profileFullName.textContent = user.user_metadata.username;
    } else {
        profileFullName.textContent = user.email.split('@')[0];
    }

    profileEmail.textContent = user.email;

    // Update info cards
    document.getElementById('infoFullName').textContent = user.user_metadata?.full_name || 'Not specified';
    document.getElementById('infoUsername').textContent = user.user_metadata?.username || user.email.split('@')[0];
    document.getElementById('infoEmail').textContent = user.email;
    
    // Format the created_at date
    const createdAt = new Date(user.created_at);
    const joinDate = createdAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('infoJoinDate').textContent = joinDate;

    // Update professional info
    document.getElementById('infoCompany').textContent = user.user_metadata?.company || 'Not specified';
    document.getElementById('infoJobTitle').textContent = user.user_metadata?.job_title || 'Not specified';
    document.getElementById('infoIndustry').textContent = user.user_metadata?.industry || 'Not specified';

    // Update location info
    document.getElementById('infoCountry').textContent = user.user_metadata?.country || 'Not specified';
    document.getElementById('infoCity').textContent = user.user_metadata?.city || 'Not specified';
    document.getElementById('infoTimezone').textContent = user.user_metadata?.timezone || 'Not specified';

    // Update account status
    document.getElementById('infoPlan').textContent = user.user_metadata?.plan || 'Free';
    document.getElementById('infoStatus').textContent = 'Active';
    
    // Format last login date
    const lastLogin = new Date(user.last_sign_in_at || user.created_at);
    const lastLoginText = isToday(lastLogin) ? 'Today' : lastLogin.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('infoLastLogin').textContent = lastLoginText;

    // Set form values
    document.getElementById('editFullName').value = user.user_metadata?.full_name || '';
    document.getElementById('editUsername').value = user.user_metadata?.username || user.email.split('@')[0];
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editCompany').value = user.user_metadata?.company || '';
    document.getElementById('editJobTitle').value = user.user_metadata?.job_title || '';
    
    if (user.user_metadata?.industry) {
        document.getElementById('editIndustry').value = user.user_metadata.industry;
    }
    
    if (user.user_metadata?.country) {
        document.getElementById('editCountry').value = user.user_metadata.country;
    }
    
    document.getElementById('editCity').value = user.user_metadata?.city || '';
    
    if (user.user_metadata?.timezone) {
        document.getElementById('editTimezone').value = user.user_metadata.timezone;
    }
}

// Check if a date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });

    // Profile avatar upload
    const profileAvatar = document.querySelector('.profile-avatar');
    const avatarUpload = document.getElementById('avatarUpload');
    
    profileAvatar.addEventListener('click', () => {
        avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', handleAvatarUpload);

    // Cover photo upload
    const changeCoverBtn = document.getElementById('changeCoverBtn');
    const coverUpload = document.getElementById('coverUpload');
    
    changeCoverBtn.addEventListener('click', () => {
        coverUpload.click();
    });
    
    coverUpload.addEventListener('change', handleCoverUpload);

    // Edit buttons
    document.getElementById('editBasicInfoBtn').addEventListener('click', () => openModal('basicInfoModal'));
    document.getElementById('editProfessionalInfoBtn').addEventListener('click', () => openModal('professionalInfoModal'));
    document.getElementById('editLocationInfoBtn').addEventListener('click', () => openModal('locationInfoModal'));
    document.getElementById('changePasswordBtn').addEventListener('click', () => openModal('changePasswordModal'));

    // Close modals
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(element => {
        element.addEventListener('click', closeAllModals);
    });

    // Form submissions
    document.getElementById('basicInfoForm').addEventListener('submit', handleBasicInfoSubmit);
    document.getElementById('professionalInfoForm').addEventListener('submit', handleProfessionalInfoSubmit);
    document.getElementById('locationInfoForm').addEventListener('submit', handleLocationInfoSubmit);
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChangeSubmit);

    // Password strength meter
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', e => updatePasswordStrength(e.target.value));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);

    // Other security buttons
    document.getElementById('enable2FABtn').addEventListener('click', () => showToast('Two-factor authentication feature coming soon!', 'info'));
    document.getElementById('viewLoginHistoryBtn').addEventListener('click', () => showToast('Login history feature coming soon!', 'info'));
    document.getElementById('securityAlertsBtn').addEventListener('click', () => showToast('Security alerts management coming soon!', 'info'));
    document.getElementById('upgradePlanBtn').addEventListener('click', () => showToast('Plan upgrade feature coming soon!', 'info'));
}

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

// Handle avatar upload
async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        showToast('Uploading avatar...', 'info');
        
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${currentUser.id}/${fileName}`;
        
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('profiles')
            .upload(filePath, file, {
                upsert: true
            });
            
        if (error) throw error;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);
            
        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                avatar_url: publicUrl
            }
        });
        
        if (updateError) throw updateError;
        
        // Update the UI
        document.getElementById('profileImage').src = publicUrl;
        document.getElementById('profileAvatarLarge').src = publicUrl;
        
        showToast('Avatar updated successfully!', 'success');
    } catch (error) {
        console.error('Error uploading avatar:', error);
        showToast('Failed to upload avatar. Please try again.', 'error');
    }
}

// Handle cover photo upload
async function handleCoverUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        showToast('Uploading cover photo...', 'info');
        
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `cover-${Date.now()}.${fileExt}`;
        const filePath = `covers/${currentUser.id}/${fileName}`;
        
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('profiles')
            .upload(filePath, file, {
                upsert: true
            });
            
        if (error) throw error;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);
            
        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                cover_url: publicUrl
            }
        });
        
        if (updateError) throw updateError;
        
        // Update the UI
        document.querySelector('.profile-cover').style.backgroundImage = `url(${publicUrl})`;
        
        showToast('Cover photo updated successfully!', 'success');
    } catch (error) {
        console.error('Error uploading cover photo:', error);
        showToast('Failed to upload cover photo. Please try again.', 'error');
    }
}

// Open a modal
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Handle basic info form submission
async function handleBasicInfoSubmit(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('editFullName').value;
    const username = document.getElementById('editUsername').value;
    
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
        
        closeAllModals();
        showToast('Profile information updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile information. Please try again.', 'error');
    }
}

// Handle professional info form submission
async function handleProfessionalInfoSubmit(event) {
    event.preventDefault();
    
    const company = document.getElementById('editCompany').value;
    const jobTitle = document.getElementById('editJobTitle').value;
    const industry = document.getElementById('editIndustry').value;
    
    try {
        showToast('Updating professional information...', 'info');
        
        const { error } = await supabase.auth.updateUser({
            data: {
                company: company,
                job_title: jobTitle,
                industry: industry
            }
        });
        
        if (error) throw error;
        
        // Refresh user data
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) throw getUserError;
        
        // Update UI
        updateProfileInfo(user);
        
        closeAllModals();
        showToast('Professional information updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating professional info:', error);
        showToast('Failed to update professional information. Please try again.', 'error');
    }
}

// Handle location info form submission
async function handleLocationInfoSubmit(event) {
    event.preventDefault();
    
    const country = document.getElementById('editCountry').value;
    const city = document.getElementById('editCity').value;
    const timezone = document.getElementById('editTimezone').value;
    
    try {
        showToast('Updating location information...', 'info');
        
        const { error } = await supabase.auth.updateUser({
            data: {
                country: country,
                city: city,
                timezone: timezone
            }
        });
        
        if (error) throw error;
        
        // Refresh user data
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) throw getUserError;
        
        // Update UI
        updateProfileInfo(user);
        
        closeAllModals();
        showToast('Location information updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating location info:', error);
        showToast('Failed to update location information. Please try again.', 'error');
    }
}

// Handle password change form submission
async function handlePasswordChangeSubmit(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmNewPassword) {
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
        
        closeAllModals();
        showToast('Password updated successfully!', 'success');
        
        // Clear the form
        document.getElementById('changePasswordForm').reset();
    } catch (error) {
        console.error('Error updating password:', error);
        showToast('Failed to update password. Please try again.', 'error');
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

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Animate logout
        gsap.to('.profile-container', {
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
    // Check if cover photo exists in user metadata
    if (currentUser.user_metadata?.cover_url) {
        document.querySelector('.profile-cover').style.backgroundImage = `url(${currentUser.user_metadata.cover_url})`;
    }
    
    // Animate profile cards
    gsap.from('.profile-info-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });
    
    // Animate security cards
    gsap.from('.security-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });
    
    // Animate timeline items
    gsap.from('.timeline-item', {
        x: -30,
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
        await initializeProfile();
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