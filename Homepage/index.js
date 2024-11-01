// Ursprünglicher Code für die Zugriffsberechtigung, auskommentiert für Sicherheit
// window.onload = function() {
//     const userLoggedIn = sessionStorage.getItem('userLoggedIn');
//
//     if (userLoggedIn !== 'true') {
//         console.log('Bitte einloggen, um diese Seite zu sehen.');
//         setTimeout(() => {
//             window.location.href = '../Account page/account.html';
//         }, 1000);
//     }
// };

//bis hierhin war vorheriger code ab jetzt meiner

// Import-Statements und neuer Code
import { ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { storage } from '../Firebase/Fire.js';
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const auth = getAuth();

// Funktion zur Prüfung der Zugriffsberechtigung (kann neu hinzugefügt werden)
function checkUserLoggedIn() {
    const userLoggedIn = sessionStorage.getItem('userLoggedIn');
    if (userLoggedIn !== 'true') {
        console.log('Bitte einloggen, um diese Seite zu sehen.');
        setTimeout(() => {
            window.location.href = '../Account page/account.html';
        }, 1000);
    }
}

// Funktion für das Laden von Bildern
function loadRandomImage(category, containerId) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const path = `users/${user.uid}/images/${category}/`;
            const storageRef = ref(storage, path);

            listAll(storageRef).then((result) => {
                if (result.items.length > 1) { // Prüfe, ob es mehr als ein Bild gibt
                    const container = document.getElementById(containerId);
                    const currentImageSrc = container.querySelector('img') ? container.querySelector('img').src : null;
                    let newItemRef;

                    do {
                        const randomIndex = Math.floor(Math.random() * result.items.length);
                        newItemRef = result.items[randomIndex];
                    } while (currentImageSrc && currentImageSrc.includes(newItemRef.name));

                    getDownloadURL(newItemRef).then((url) => {
                        container.innerHTML = ''; // Vorherigen Inhalt löschen
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = category;
                        container.appendChild(img);
                    });
                } else if (result.items.length === 1) {
                    // Wenn nur ein Bild vorhanden ist, zeige dieses an
                    getDownloadURL(result.items[0]).then((url) => {
                        const container = document.getElementById(containerId);
                        container.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = category;
                        container.appendChild(img);
                    });
                } else {
                    console.warn(`Keine Bilder in der Kategorie ${category} gefunden.`);
                }
            }).catch((error) => {
                console.error(`Fehler beim Laden der Bilder aus ${category}:`, error);
            });
        } else {
            console.log("User not logged in.");
        }
    });
}



function shuffleOutfit() {
    loadRandomImage('Kopfbedeckung', 'head-container');
    loadRandomImage('Tops', 'top-container');
    loadRandomImage('Bottoms', 'bottom-container');
    loadRandomImage('Schuhe', 'shoes-container');
}

// Event-Listener für den Shuffle-Button hinzufügen
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('shuffle-button').addEventListener('click', shuffleOutfit);
});


// Beispiel-Aufruf für das Laden von Bildern beim Seitenstart
window.onload = function() {
    loadRandomImage('Kopfbedeckung', 'head-container');
    loadRandomImage('Tops', 'top-container');
    loadRandomImage('Bottoms', 'bottom-container');
    loadRandomImage('Schuhe', 'shoes-container');
};
