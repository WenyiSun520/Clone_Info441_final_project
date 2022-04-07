import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDurSUnz2hKsjT9C2cFFRWAwwFt8029jso",
    authDomain: "sd-2-b7378.firebaseapp.com",
    projectId: "sd-2-b7378",
    storageBucket: "sd-2-b7378.appspot.com",
    messagingSenderId: "761904723391",
    appId: "1:761904723391:web:d09674dcebd8d2adb85d0a",
    measurementId: "G-3B2BQ3TKVX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;