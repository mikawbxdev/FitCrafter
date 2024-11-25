import { ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { storage } from '../Firebase/Fire.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { deleteObject, ref as storageRef, getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { auth } from '../Firebase/Fire.js';


function loadUserImages() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const categories = ['Tops', 'Bottoms', 'Kopfbedeckung', 'Schuhe'];
            categories.forEach(category => {
                const path = `users/${user.uid}/images/${category}/`;
                const storageRef = ref(getStorage(), path);

                listAll(storageRef).then((result) => {
                    result.items.forEach((itemRef) => {
                        getDownloadURL(itemRef).then((url) => {
                            displayImage(url, itemRef.name, category); // Übergib 'category'
                        });
                    });
                }).catch((error) => {
                    console.error("Error loading images:", error);
                });
            });
        } else {
            console.log("No user logged in.");
        }
    });
}

function displayImage(url, name, category) {
    const container = document.querySelector('.gridContainer');
    const itemBox = document.createElement('div');
    itemBox.className = 'itembox';

    const img = document.createElement('img');
    img.src = url;
    img.alt = name;

    const closeButton = document.createElement('button');
    closeButton.className = 'close-btn';
    closeButton.innerHTML = '<img src="/Content/Icons/x-button.png" alt=""/>';

    // Event-Listener für den "Löschen"-Button
    closeButton.addEventListener('click', () => {
        // Bild aus Firebase Storage löschen
        const storageReference = storageRef(getStorage(), `users/${auth.currentUser.uid}/images/${category}/${name}`);

        deleteObject(storageReference).then(() => {
            console.log('Bild erfolgreich gelöscht:', name);
            // Bild aus dem DOM entfernen
            container.removeChild(itemBox);
            // Erfolgsmeldung anzeigen
            showAlert('Bild erfolgreich gelöscht.', 'success');
        }).catch((error) => {
            console.error('Fehler beim Löschen des Bildes:', error);
            showAlert('Fehler beim Löschen des Bildes.', 'error');
        });
    });

    itemBox.appendChild(closeButton);
    itemBox.appendChild(img);
    container.appendChild(itemBox);
}


export function showAlert(message, type = 'success') {
    // Erstelle ein div-Element für den Alert
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert'); // Allgemeine Klasse für alle Alerts
    alertDiv.classList.add(type); // Klasse für den spezifischen Typ (success, error)

    // HTML-Struktur für den Alert erstellen
    alertDiv.innerHTML = `
        <div class="alert__icon">
            <!-- Optional: Füge hier ein SVG-Icon hinzu -->
        </div>
        <div class="alert__title">${message}</div>
        <div class="alert__close" onclick="this.parentElement.remove()">
            &times;
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

export { loadUserImages };