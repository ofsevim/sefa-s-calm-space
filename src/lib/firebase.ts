import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFunctions } from "firebase/functions";

const env = import.meta.env;

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || "mock-api-key",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "sefasevim-9d8f8.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "sefasevim-9d8f8",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "sefasevim-9d8f8.appspot.com",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "364128165772",
    appId: env.VITE_FIREBASE_APP_ID || "1:364128165772:web:abcdef",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const appCheckSiteKey = env.VITE_RECAPTCHA_V3_SITE_KEY;
if (appCheckSiteKey && typeof window !== "undefined") {
    if (env.DEV) {
        (globalThis as typeof globalThis & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
    });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "europe-west1");
