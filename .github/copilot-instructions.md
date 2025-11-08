# Copilot Instructions for LogApps

## Project Overview
LogApps is a Firebase-based authentication web application with a clean, responsive design. It follows a frontend-only architecture using vanilla JavaScript ES6 modules and Firebase services for authentication and data storage.

**Deployment Status**: ✅ Successfully deployed on Vercel with full responsive design and Firebase integration ready.

## Architecture & File Organization

### Core Structure
- **Entry Point**: `index.html` - Main dashboard (protected route)
- **Authentication Pages**: `login.html`, `signup.html` - Public authentication forms
- **Firebase Setup**: `firebase.js` and `index.js` - Both contain identical Firebase configuration (redundant files)
- **Scripts**: `script/` directory contains page-specific JavaScript modules
- **Styles**: `css/` directory with page-specific stylesheets

### Firebase Integration Pattern
```javascript
// Import pattern used throughout the app
import {getAuth, signInWithEmailAndPassword, doc, setDoc, db} from "../index.js";
```

**Key Pattern**: All Firebase imports go through `index.js`, which re-exports Firebase SDK functions. The `firebase.js` file is redundant and contains identical configuration.

## Critical Conventions

### 1. Authentication Flow
- **Protected Route**: `index.html` checks auth state on load, redirects to `login.html` if not authenticated
- **Auth State Management**: Uses Firebase `onAuthStateChanged` listener in `index.html`
- **User Data Storage**: User profiles stored in Firestore `users` collection with structure:
  ```javascript
  {
    name: string,
    email: string,
    photo?: string  // Only for Google sign-in
  }
  ```

### 2. Navigation Patterns
- **Login/Signup**: Use `location.href = "../index.html"` for post-auth redirect
- **Logout**: Use `location.pathname = "/login.html"` or `location.href = "login.html"`
- **URL Cleanup**: Scripts include `window.location.replace('/')` to clean `index.html` from URLs

### 3. Error Handling Convention
- **Error Display**: All forms use `<p id="error-code"></p>` element for error messages
- **Error Format**: `errorCode.innerHTML = \`Error: ${errorMessage}\`;`
- **Field Validation**: Check for empty fields before Firebase operations

### 4. Form Handling Patterns
```javascript
// Standard form clearing pattern used in both login.js and signup.js
finally {
    document.getElementById('email').value = ""
    document.getElementById('password').value = ""
}
```

### 5. Google Authentication
- Both login and signup pages support Google sign-in with `GoogleAuthProvider`
- Google users get additional `photo` field in Firestore document
- Same handler pattern: `handleGoogleSignIn` function with `signInWithPopup`
- ✅ **Google Sign-in Button**: Properly styled and positioned in UI

## Completed Features & Deployment Status

✅ **Website Deployment** - Successfully deployed on Vercel  
✅ **Responsive Design** - Beautiful, mobile-first design with extensive media queries  
✅ **File Linking** - All CSS, JS, and HTML files properly connected  
✅ **Firebase Integration** - Ready to work once domain is authorized  
✅ **Form Functionality** - Login form displaying and working correctly  
✅ **Navigation** - "Forgot your password?" link visible and functional  
✅ **Google Sign-in** - Button properly styled and positioned

## Development Guidelines

### Working with Authentication
- Always import Firebase functions from `../index.js`, not directly from CDN
- Use `getAuth()` to get auth instance, don't store it globally
- Clear form fields in `finally` blocks for consistent UX

### Styling Approach
- **Responsive Design**: Mobile-first with extensive media queries (768px, 480px breakpoints)
- **CSS Organization**: Page-specific stylesheets (login.css, signup.css)
- **Design System**: Consistent color scheme (#007bff primary, #f5f5f5 background)

### Code Quality Issues to Address
1. **Duplicate Firebase Config**: `firebase.js` and `index.js` contain identical code
2. **Inconsistent Error Logging**: Some errors only console.log, others display to user
3. **Mixed Auth Patterns**: Multiple logout handlers in same files
4. **Path Inconsistencies**: Some use relative paths (`../`), others absolute (`/`)

### Firebase Configuration
- Project ID: `myapplogs-94b86`
- Uses Firestore for user data storage
- Authentication methods: Email/password and Google OAuth

## Testing & Debugging
- **Development Server**: Serve files locally due to ES6 module imports
- **Auth Testing**: Use browser dev tools to inspect Firebase auth state
- **Error Debugging**: Check browser console and the `#error-code` element

## Key Files for Common Tasks
- **Auth Logic**: `script/login.js`, `script/signup.js`
- **Firebase Setup**: `index.js` (primary), `firebase.js` (duplicate)
- **Protected Route**: `index.html` main dashboard
- **Styling**: `css/login.css`, `css/signup.css`

## Dependencies

- Firebase v11.2.0 (auth, firestore, app)
- No build system or package manager
- Pure vanilla JavaScript with ES6 modules