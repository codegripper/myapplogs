import { getAuth, sendPasswordResetEmail, onAuthStateChanged } from "../index.js";

const auth = getAuth();

// Enhanced message display function
const showMessage = (message, type = 'error') => {
  const container = document.getElementById('message-container');
  container.innerHTML = `<div class="message ${type}">${message}</div>`;
  
  if (type === 'success') {
    setTimeout(() => {
      container.innerHTML = '';
    }, 10000); // Keep success message longer
  } else {
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }
};

// Loading state management
const setButtonLoading = (button, isLoading, successState = false) => {
  if (successState) {
    button.classList.remove('loading');
    button.classList.add('success');
    button.disabled = false;
    return;
  }
  
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
};

// Password reset function
const resetPassword = async () => {
  const resetButton = document.getElementById('reset-button');
  const emailInput = document.getElementById('email');
  
  try {
    setButtonLoading(resetButton, true);
    
    const email = emailInput.value.trim();
    
    // Validation
    if (!email) {
      showMessage('Please enter your email address', 'error');
      return;
    }
    
    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    // Send password reset email
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + '/login.html',
      handleCodeInApp: false
    });
    
    console.log("Password reset email sent successfully");
    
    // Show success message
    showMessage(
      `Password reset link sent to ${email}. Please check your inbox and spam folder.`,
      'success'
    );
    
    // Update button to success state
    setButtonLoading(resetButton, false, true);
    
    // Clear the form
    emailInput.value = '';
    
    // Optional: Redirect to login after delay
    setTimeout(() => {
      showMessage(
        'Redirecting to login page...',
        'info'
      );
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    }, 3000);
    
  } catch (error) {
    console.error("Password reset error:", error);
    
    // User-friendly error messages
    let errorMessage = getFirebaseErrorMessage(error.code);
    showMessage(errorMessage, 'error');
    
  } finally {
    if (!resetButton.classList.contains('success')) {
      setButtonLoading(resetButton, false);
    }
  }
};

// Email validation utility
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Firebase error message mapping
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address. Please check your email or create a new account.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many password reset attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/invalid-continue-uri': 'Invalid redirect URL configuration.',
    'auth/unauthorized-continue-uri': 'Unauthorized redirect URL.',
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again or contact support.';
};

// Check if user is already signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is already signed in, redirect to dashboard
    console.log("User already signed in:", user.email);
    window.location.href = "/index.html";
  }
});

// Event listeners
document.getElementById('reset-button').addEventListener("click", (e) => {
  e.preventDefault();
  resetPassword();
});

// Form submission handler
document.getElementById('resetForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  resetPassword();
});

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeElement = document.activeElement;
    if (activeElement.id === 'email') {
      e.preventDefault();
      resetPassword();
    }
  }
});

// Auto-focus email input
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('email').focus();
});