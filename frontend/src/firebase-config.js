// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChZGaDuPLKoLifVfYcEIBnKpH5X3O6v_E",
  authDomain: "test-real-estate-6270c.firebaseapp.com",
  projectId: "test-real-estate-6270c",
  storageBucket: "test-real-estate-6270c.firebasestorage.app",
  messagingSenderId: "1088261042693",
  appId: "1:1088261042693:web:4714dc9e3ae22175b6626c",
  measurementId: "G-2918XFWKH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: Initialize Analytics if needed
// export const analytics = getAnalytics(app);