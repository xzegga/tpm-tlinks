import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    databaseURL: import.meta.env.VITE_DATABASE_URL,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig, {});

export const auth = getAuth(app);
export const functions = getFunctions(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (location.hostname === 'localhost') {
    // connectFirestoreEmulator(db, '127.0.0.1', 5004);
    // connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    // connectFunctionsEmulator(functions, '127.0.0.1', 5003);
    // connectStorageEmulator(storage, '127.0.0.1', 9199);
}
