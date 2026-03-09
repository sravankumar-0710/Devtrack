import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:            "AIzaSyDQi3qpIjhWzOp5_NyAGk1vsAeIKPIxr2g",
  authDomain:        "devtrack-a3e61.firebaseapp.com",
  projectId:         "devtrack-a3e61",
  storageBucket:     "devtrack-a3e61.firebasestorage.app",
  messagingSenderId: "1071905082327",
  appId:             "1:1071905082327:web:96a9efd32878c041b65992",
  databaseURL:       "https://devtrack-a3e61-default-rtdb.firebaseio.com",
};

const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const db       = getDatabase(app);
export const provider = new GoogleAuthProvider();