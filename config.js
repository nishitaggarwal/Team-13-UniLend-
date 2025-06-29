// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";


import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjSd0w6gdK9fypUvhw8nbdGSTdU0cKRng",
  authDomain: "unilend-361f4.firebaseapp.com",
  projectId: "unilend-361f4",
  storageBucket: "unilend-361f4.firebasestorage.app",
  messagingSenderId: "6563650264",
  appId: "1:6563650264:web:9b0061bc074106b792d5ad",
  measurementId: "G-4ZMDSCK8XK"
};

// Initialize app only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };