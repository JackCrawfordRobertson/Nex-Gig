import { initializeApp } from "firebase/app";
import { getFirestore, doc as firestoreDoc, updateDoc, getDocs, collection, getDoc as firestoreGetDoc, setDoc as firestoreSetDoc } from "firebase/firestore";
import { getAuth as firebaseGetAuth } from "firebase/auth";
import { getStorage as firebaseGetStorage, ref as storageRef, uploadBytes as uploadBytesStorage, getDownloadURL as getDownloadURLStorage } from "firebase/storage";

// Import mock implementations when in development/test mode
import * as mockFirebase from "@/lib/firebase-mock.js";

// Load Firebase config from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Export the appropriate implementation based on environment
export const auth = isDevelopment ? mockFirebase.getAuth() : firebaseGetAuth(app);
export const db = getFirestore(app);
export const storage = isDevelopment ? mockFirebase.getStorage() : firebaseGetStorage(app);

// Determine the appropriate app URL based on environment
export const appUrl = isDevelopment 
    ? "http://localhost:3000" 
    : "https://next.gig.jack-robertson.co.uk";

// Configure ActionCodeSettings for password reset
export const actionCodeSettings = {
    url: `${appUrl}/login`,
    handleCodeInApp: false,
};

// Export the appropriate functions based on environment
export const doc = isDevelopment ? mockFirebase.doc : firestoreDoc;
export const getDoc = isDevelopment ? mockFirebase.getDoc : firestoreGetDoc;
export const setDoc = isDevelopment ? mockFirebase.setDoc : firestoreSetDoc;
export const ref = isDevelopment ? mockFirebase.ref : storageRef;
export const uploadBytes = isDevelopment ? mockFirebase.uploadBytes : uploadBytesStorage;
export const getDownloadURL = isDevelopment ? mockFirebase.getDownloadURL : getDownloadURLStorage;
export { updateDoc, getDocs, collection };