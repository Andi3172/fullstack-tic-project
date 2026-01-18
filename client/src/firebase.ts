import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3H9aTihxll8OeggHIMaIM2QvIaNfXiMA",
  authDomain: "fullstack-tic-project.firebaseapp.com",
  projectId: "fullstack-tic-project",
  storageBucket: "fullstack-tic-project.firebasestorage.app",
  messagingSenderId: "315244394746",
  appId: "1:315244394746:web:e3a7c301106d00abf6f143"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
