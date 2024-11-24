// Importiere die notwendigen Firebase-Module
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// Deine Firebase-Konfiguration (aktualisiere diese mit deinen Firebase-Werten)
const firebaseConfig = {
    apiKey: "AIzaSyC_t4799qenZNVtznHqbObyyWYzZCX_9G8",
    authDomain: "fitcrafter-e6ed3.firebaseapp.com",
    projectId: "fitcrafter-e6ed3",
    storageBucket: "fitcrafter-e6ed3.appspot.com",
    messagingSenderId: "408380243205",
    appId: "1:408380243205:web:73edefc089384e22314b6c",
    measurementId: "G-TTQRMVMG2B"
};

// Überprüfen, ob eine App bereits existiert, bevor eine neue initialisiert wird
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0]; // Falls die App bereits existiert, verwende sie
}

// Firebase Auth und Storage initialisieren
const auth = getAuth(app); // Authentifizierung
const storage = getStorage(app); // Storage

// Auth und Storage exportieren
export { auth, storage };
