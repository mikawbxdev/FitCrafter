import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Deine Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyC_t4799qenZNVtznHqbObyyWYzZCX_9G8",
    authDomain: "fitcrafter-e6ed3.firebaseapp.com",
    projectId: "fitcrafter-e6ed3",
    storageBucket: "fitcrafter-e6ed3.appspot.com",
    messagingSenderId: "408380243205",
    appId: "1:408380243205:web:73edefc089384e22314b6c",
    measurementId: "G-TTQRMVMG2B"
};

// Initialisiere Firebase
const app = initializeApp(firebaseConfig);

// Initialisiere Firebase Authentication
const auth = getAuth(app);

function clearErrors() {
    // Suche nach allen Elementen mit der Klasse 'input-alert' (Fehlermeldungen unter den Feldern)
    const errorElements = document.querySelectorAll('.input-alert');
    errorElements.forEach((element) => {
        element.textContent = ''; // Textinhalt der Fehlermeldung entfernen
        element.classList.remove('visible'); // Klasse 'visible' entfernen, um die Fehlermeldung auszublenden
    });
}

let isRegistering = true; // Standardmäßig im Registrierungsmodus

// Funktion zum Registrieren eines neuen Benutzers
function registerUser() {
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;

    // Validierungen
    if (!name) {
        showAlert('Please enter your name.', 'error'); // Fehler-Alert in rot
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'error'); // Fehler-Alert in rot
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Benutzerprofil mit Namen aktualisieren
            return updateProfile(user, { displayName: name });
        })
        .then(() => {
            showAlert('User registered successfully with email: ' + email + ' and name: ' + name, 'success'); // Erfolgsmeldung mit Name
            showProfile(name, email);
        })
        .catch((error) => {
            showAlert('Error: ' + error.message, 'error'); // Fehler beim Registrieren oder Aktualisieren
        });
}

// Funktion zum Anmelden eines Benutzers
function loginUser() {
    // Alle vorhandenen Fehler ausblenden
    clearErrors();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    let hasError = false;

    // Validierungen für das E-Mail-Feld
    if (!email) {
        showAlert('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
        hasError = true;
    }

    // Validierungen für das Passwort-Feld
    if (password.length < 6) {
        showAlert( 'Das Passwort muss mindestens 6 Zeichen lang sein.', 'error');
        hasError = true;
    }

    // Wenn ein Fehler aufgetreten ist, wird die Anmeldung abgebrochen
    if (hasError) {
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showAlert('User logged in successfully with email: ' + userCredential.user.email, 'success');

            // Fading-Effekt hinzufügen
            document.body.classList.add('fade-out'); // Füge die Fade-Out-Klasse zum Body hinzu

            // Warte 0.5 Sekunden (entspricht der CSS-Animation), bevor du weiterleitest
            setTimeout(() => {
                window.location.href = '../Homepage/home.html'; // Weiterleitung auf die Homepage
            }, 500); // Zeit in Millisekunden (0.5 Sekunden)
        })
        .catch((error) => {
            showAlert(error.message, 'error'); // Zeige Fehler unter dem E-Mail-Feld an
        });
}


// Passwort-Sichtbarkeit umschalten
const togglePassword = document.querySelector('#togglePassword');
const passwordField = document.querySelector('#password');
const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');
const confirmPasswordField = document.querySelector('#confirmPassword');

togglePassword.addEventListener('click', function () {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
});

toggleConfirmPassword.addEventListener('click', function () {
    const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordField.setAttribute('type', type);
});

// Event Listener für die Schaltfläche (Register oder Login)
document.querySelector('#submitButton').addEventListener('click', () => {
    if (isRegistering) {
        registerUser();
    } else {
        loginUser();
    }
});

/// Wechseln zwischen Registrieren und Anmelden
function toggleFormMode(e) {
    e.preventDefault();

    if (isRegistering) {
        // Wechsel auf Login-Modus
        document.querySelector('#form-title').textContent = 'Login';
        document.querySelector('#submitButton').textContent = 'Login';
        document.querySelector('#toggleForm').innerHTML = '<span>Neu hier? </span><a href="#" id="toggleToLogin">Jetzt registrieren</a>';
        document.querySelector('#nameRow').style.display = 'none';
        document.querySelector('#confirmPasswordRow').style.display = 'none';
        isRegistering = false;
    } else {
        // Wechsel auf Registrierungsmodus
        document.querySelector('#form-title').textContent = 'Register';
        document.querySelector('#submitButton').textContent = 'Register';
        document.querySelector('#toggleForm').innerHTML = '<span>Bereits registriert? </span><a href="#" id="toggleToLogin">Hier einloggen</a>';
        document.querySelector('#nameRow').style.display = 'table-row';
        document.querySelector('#confirmPasswordRow').style.display = 'table-row';
        isRegistering = true;
    }

    // Den Event Listener erneut binden, damit der Link nach dem Wechsel funktioniert
    document.querySelector('#toggleToLogin').addEventListener('click', toggleFormMode);
}

// Initialer Event Listener für den Wechsel zwischen Registrierung und Login
document.querySelector('#toggleToLogin').addEventListener('click', toggleFormMode);

// Funktion zum Erstellen und Anzeigen eines Alerts
function showAlert(message, type = 'success') {
    // Erstelle ein div-Element für den Alert
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert'); // Allgemeine Klasse für alle Alerts
    alertDiv.classList.add(type); // Klasse für den spezifischen Typ (success, error)

    // HTML-Struktur für den Alert erstellen
    alertDiv.innerHTML = `
        <div class="alert__icon">
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm4.768 9.14c.088-.1.155-.217.197-.344.042-.127.058-.26.048-.393-.01-.133-.048-.262-.109-.38-.061-.118-.146-.223-.248-.309-.102-.085-.221-.149-.348-.188s-.262-.052-.394-.038c-.133.014-.261.054-.378.118-.117.064-.22.151-.303.255l-4.3 5.159-2.225-2.226c-.189-.182-.441-.283-.703-.281s-.513.108-.699.293-.291.436-.293.699c-.002.262.099.515.281.703l3 3c.098.098.216.175.345.225.13.05.268.073.407.067.139-.006.275-.041.399-.103.124-.062.235-.149.324-.255z" />
            </svg>
        </div>
        <div class="alert__title">${message}</div>
        <div class="alert__close" onclick="this.parentElement.remove()">
            <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.833 5.342l-1.175-1.175L10 9.158 5.342 4.167 4.167 5.342 9.158 10l-4.99 4.99 1.175 1.175 4.99-4.99 4.99 4.99 1.175-1.175L10.842 10z" />
            </svg>
        </div>
    `;

    // Alert zum Container hinzufügen
    const alertContainer = document.getElementById('alert-container');
    alertContainer.appendChild(alertDiv);

    // Alert nach 5 Sekunden automatisch entfernen
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged((user) => {
        var accountBox = document.getElementById('accountBox');
        if (user) {
            // Der Benutzer ist eingeloggt
            sessionStorage.setItem('userLoggedIn', 'true');
            console.log('User is logged in:', user.email);
            accountBox.style.display = 'none';
            showProfile(user.displayName, user.email)
        } else {
            // Der Benutzer ist nicht eingeloggt
            accountBox.style.display = 'flex';
            sessionStorage.setItem('userLoggedIn', 'false');
            console.log('User is not logged in');
        }
    });
});

function showProfile(name, email) {
    const accountBox2 = document.getElementById('accountBox2');
    accountBox2.style.display = 'flex';
    accountBox2.innerHTML = `
        <h2>Profile</h2>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
    `;
}