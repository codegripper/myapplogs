import {
  getAuth,
  createUserWithEmailAndPassword,
  doc,
  setDoc,
  db,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "../index.js";

const auth = getAuth();
let errorCode = document.getElementById("error-code");

// Enhanced error display function
const showError = (message) => {
  errorCode.innerHTML = message;
  errorCode.classList.add('show');
  setTimeout(() => {
    errorCode.classList.remove('show');
  }, 5000);
};

// Loading state management
const setButtonLoading = (button, isLoading) => {
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
};

// Enhanced signup function
const signup = async () => {
  const signupButton = document.getElementById("signup");
  
  try {
    setButtonLoading(signupButton, true);
    
    // Get form values
    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;

    // Comprehensive validation
    if (!username || !email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (username.length < 2) {
      showError('Name must be at least 2 characters long');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (!isStrongPassword(password)) {
      showError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      return;
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("User created successfully:", user);

    // Save comprehensive user data to Firestore
    const userData = {
      name: username,
      email: email,
      provider: 'email',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: user.emailVerified,
      uid: user.uid,
      profileComplete: true
    };

    await setDoc(doc(db, "users", user.uid), userData);
    console.log("User data saved to Firestore successfully");

    // Show success message and redirect
    showSuccess("Account created successfully! Redirecting...");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 2000);

  } catch (error) {
    console.error("Signup error:", error);
    
    // User-friendly error messages
    let errorMessage = getFirebaseErrorMessage(error.code);
    showError(errorMessage);
    
  } finally {
    setButtonLoading(signupButton, false);
    // Clear form fields
    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  }
};

// Enhanced Google Sign-In for signup
const handleGoogleSignIn = async () => {
  const googleButton = document.getElementById("handleGoogleSignIn");
  
  try {
    setButtonLoading(googleButton, true);
    
    const provider = new GoogleAuthProvider();
    
    // Request additional scopes
    provider.addScope('profile');
    provider.addScope('email');
    
    // Configure custom parameters
    provider.setCustomParameters({
      'prompt': 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("Google sign-up successful:", user);

    // Save comprehensive user data to Firestore
    const userData = {
      name: user.displayName || 'Anonymous User',
      email: user.email,
      photo: user.photoURL || null,
      provider: 'google',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: user.emailVerified,
      uid: user.uid,
      profileComplete: true
    };

    await setDoc(doc(db, "users", user.uid), userData, { merge: true });
    
    console.log("Google user data saved to Firestore");
    
    // Show success and redirect
    showSuccess("Account created with Google! Redirecting...");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 2000);
    
  } catch (error) {
    console.error("Google sign-up error:", error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      showError('Sign-up was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      showError('Pop-up blocked. Please enable pop-ups and try again.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      showError('An account already exists with this email. Please sign in instead.');
    } else {
      let errorMessage = getFirebaseErrorMessage(error.code);
      showError(errorMessage);
    }
  } finally {
    setButtonLoading(googleButton, false);
  }
};

// Success message display
const showSuccess = (message) => {
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.innerHTML = message;
  successElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--success-green);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(successElement);
  
  setTimeout(() => {
    successElement.remove();
  }, 3000);
};

// Email validation utility
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
};

// Firebase error message mapping
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'An account already exists with this email address.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Account creation is currently disabled.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
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
document.getElementById("signup").addEventListener("click", (e) => {
  e.preventDefault();
  signup();
});

document.getElementById("handleGoogleSignIn").addEventListener("click", (e) => {
  e.preventDefault();
  handleGoogleSignIn();
});

// Form submission handler
document.getElementById('signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  signup();
});

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeElement = document.activeElement;
    if (activeElement.id === 'username' || activeElement.id === 'email' || activeElement.id === 'password') {
      e.preventDefault();
      signup();
    }
  }
});