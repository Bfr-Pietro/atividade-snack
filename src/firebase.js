import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAHA5-2gLuEaW-yE5u3sReYIUr_msS-xSc",
  authDomain: "nuvem2-juliano.firebaseapp.com",
  projectId: "nuvem2-juliano",
  storageBucket: "nuvem2-juliano.firebasestorage.app",
  messagingSenderId: "38462146013",
  appId: "1:38462146013:web:30a74878d3c2bd34be6234",
  measurementId: "G-T4GXBSFRZX",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  const { getAuth, initializeAuth, getReactNativePersistence } = FirebaseAuth;
  if (Platform.OS === "web" || !getReactNativePersistence) return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {

    return getAuth(app);
  }
}

function createDb() {
  try {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch (e) {
    return getFirestore(app);
  }
}

export const auth = createAuth();
export const db = createDb();
