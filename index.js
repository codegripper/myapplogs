 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
 import {signInWithPopup, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signOut, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
 import { doc, setDoc, getFirestore, getDoc} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_N4zSvMM-Y4fTXbhLaghJy6BSfNZHofc",
  authDomain: "myapplogs-94b86.firebaseapp.com",
  projectId: "myapplogs-94b86",
  storageBucket: "myapplogs-94b86.firebasestorage.app",
  messagingSenderId: "366354012889",
  appId: "1:366354012889:web:1f7e6f0369da2dc6753cc8",
  measurementId: "G-89PPRGVZS9"

};

const app = initializeApp(firebaseConfig);
 const db = getFirestore(app)
 export {getAuth, signInWithPopup, createUserWithEmailAndPassword, doc, setDoc, db, signInWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signOut, getDoc, sendPasswordResetEmail}