import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function initializeDashboard() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        // Update profile information
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

        // Handle logout
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error.message);
                return;
            }
            window.location.href = '/';
        });

    } catch (error) {
        console.error('Error initializing dashboard:', error.message);
        window.location.href = '/login.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);