import { getAuth, signOut, onAuthStateChanged, getDoc, doc, db } from "./index.js";

const auth = getAuth();

// Enhanced logout functionality
const handleLogout = async () => {
    try {
        // Show loading state
        const logoutBtn = document.getElementById("logout");
        logoutBtn.textContent = "Signing out...";
        logoutBtn.disabled = true;

        // Sign out from Firebase
        await signOut(auth);
        
        // Clear any local storage or session data
        localStorage.clear();
        sessionStorage.clear();
        
        console.log("User signed out successfully");
        
        // Redirect to login page
        window.location.href = "/login.html";
        
    } catch (error) {
        console.error("Logout error:", error);
        alert("Error signing out. Please try again.");
        
        // Reset button state
        const logoutBtn = document.getElementById("logout");
        logoutBtn.textContent = "Sign Out";
        logoutBtn.disabled = false;
    }
};

// Load and display user data
const loadUserData = async (user) => {
    try {
        console.log("Loading user data for:", user.uid);
        
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data loaded:", userData);
            
            // Update UI with user information
            updateUserUI(userData, user);
        } else {
            // Create basic user data if document doesn't exist
            console.log("User document not found, using Firebase auth data");
            const fallbackData = {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                photo: user.photoURL || null,
                provider: 'unknown',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            updateUserUI(fallbackData, user);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        // Show basic info from Firebase Auth
        const fallbackData = {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photo: user.photoURL || null
        };
        updateUserUI(fallbackData, user);
    }
};

// Update UI with user data
const updateUserUI = (userData, user) => {
    // Update navigation user info
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    // Update main user info card
    const userInfoAvatar = document.getElementById('user-info-avatar');
    const userDisplayName = document.getElementById('user-display-name');
    const userEmail = document.getElementById('user-email');
    
    const displayName = userData.name || 'User';
    const email = userData.email || user.email;
    const initials = getInitials(displayName);
    
    // Set user name
    userName.textContent = displayName;
    userDisplayName.textContent = displayName;
    userEmail.textContent = email;
    
    // Handle avatar/photo
    if (userData.photo) {
        userAvatar.innerHTML = `<img src="${userData.photo}" alt="Profile photo" />`;
        userInfoAvatar.innerHTML = `<img src="${userData.photo}" alt="Profile photo" />`;
    } else {
        userAvatar.textContent = initials;
        userInfoAvatar.textContent = initials;
    }
    
    // Update stats
    updateUserStats(userData, user);
};

// Update user statistics
const updateUserStats = (userData, user) => {
    // Join date
    const joinDate = document.getElementById('join-date');
    const createdAt = userData.createdAt || user.metadata.creationTime;
    if (createdAt) {
        const date = new Date(createdAt);
        joinDate.textContent = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
    } else {
        joinDate.textContent = 'Unknown';
    }
    
    // Last login
    const lastLogin = document.getElementById('last-login');
    const lastLoginTime = userData.lastLogin || user.metadata.lastSignInTime;
    if (lastLoginTime) {
        const date = new Date(lastLoginTime);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffHours < 1) {
            lastLogin.textContent = 'Just now';
        } else if (diffHours < 24) {
            lastLogin.textContent = `${diffHours}h ago`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            lastLogin.textContent = `${diffDays}d ago`;
        }
    } else {
        lastLogin.textContent = 'Unknown';
    }
    
    // Account type
    const accountType = document.getElementById('account-type');
    const provider = userData.provider || 'Email';
    accountType.textContent = provider === 'google' ? 'Google' : 'Email';
};

// Get user initials for avatar
const getInitials = (name) => {
    if (!name) return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Unknown';
    }
};

// Authentication state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
        loadUserData(user);
    } else {
        console.log("User is not signed in, redirecting...");
        // Redirect to login if not authenticated
        window.location.href = "/login.html";
    }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Logout button
    document.getElementById("logout").addEventListener("click", handleLogout);
    
    console.log("Dashboard initialized");
});