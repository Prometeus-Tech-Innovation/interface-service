import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC2njOWv_Hn5HZ8Hz9n-yc3m8jwqgC-XEY",
    authDomain: "jano-db.firebaseapp.com",
    projectId: "jano-db",
    storageBucket: "jano-db.firebasestorage.app",
    messagingSenderId: "290103733252",
    appId: "1:290103733252:web:bf57cd527221db08191951"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
