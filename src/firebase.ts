import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmoI4wTmCiG-5Yue6cZo9kq228C1oE6Sg",
  authDomain: "xyz-1ad2b.firebaseapp.com",
  projectId: "xyz-1ad2b",
  storageBucket: "xyz-1ad2b.appspot.com",
  messagingSenderId: "63216430415",
  appId: "1:63216430415:web:f9afd9f0d0c3e5c4e4a93a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
