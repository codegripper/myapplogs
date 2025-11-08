import {db, getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setDoc, doc, getDoc, onAuthStateChanged, sendPasswordResetEmail } from "../index.js";

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

// Enhanced email/password login
const login = async () => {
  const loginButton = document.getElementById('login');
  
  try {
    setButtonLoading(loginButton, true);
    
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("User signed in successfully:", user.email);
    
    // Check if user data exists in Firestore, create if not
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      // Update last login
      await setDoc(doc(db, "users", user.uid), {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }

    // Redirect to dashboard
    window.location.href = "/index.html";
    
  } catch (error) {
    console.error("Login error:", error);
    
    // User-friendly error messages
    let errorMessage = getFirebaseErrorMessage(error.code);
    showError(errorMessage);
  } finally {
    setButtonLoading(loginButton, false);
    // Clear form fields
    document.getElementById('email').value = "";
    document.getElementById('password').value = "";
  }
};

// Enhanced Google Sign-In with additional profile data
const handleGoogleSignIn = async () => {
  const googleButton = document.getElementById("handleGoogleSignIn");
  
  try {
    setButtonLoading(googleButton, true);
    
    const provider = new GoogleAuthProvider();
    
    // Request additional scopes for enhanced profile data
    provider.addScope('profile');
    provider.addScope('email');
    
    // Configure custom parameters
    provider.setCustomParameters({
      'prompt': 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("Google sign-in successful:", user);

    // Save comprehensive user data to Firestore
    const userData = {
      name: user.displayName || 'Anonymous User',
      email: user.email,
      photo: user.photoURL || null,
      provider: 'google',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: user.emailVerified,
      uid: user.uid
    };

    await setDoc(doc(db, "users", user.uid), userData, { merge: true });
    
    console.log("User data saved to Firestore");
    
    // Redirect to dashboard
    window.location.href = "/index.html";
    
  } catch (error) {
    console.error("Google sign-in error:", error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      showError('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      showError('Pop-up blocked. Please enable pop-ups and try again.');
    } else {
      let errorMessage = getFirebaseErrorMessage(error.code);
      showError(errorMessage);
    }
  } finally {
    setButtonLoading(googleButton, false);
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
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/email-already-in-use': 'An account already exists with this email address.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
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
document.getElementById('login').addEventListener("click", (e) => {
  e.preventDefault();
  login();
});

document.getElementById("handleGoogleSignIn").addEventListener("click", (e) => {
  e.preventDefault();
  handleGoogleSignIn();
});

// Form submission handler
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  login();
});

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeElement = document.activeElement;
    if (activeElement.id === 'email' || activeElement.id === 'password') {
      e.preventDefault();
      login();
    }
  }
});