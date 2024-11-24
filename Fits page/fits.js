import { storage } from '../Firebase/Fire.js';
import {
    ref,
    getDownloadURL,
    uploadBytes, ref as storageRef, getStorage, deleteObject
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { auth } from '../Firebase/Fire.js';

class Fit {
    constructor(kopfbedeckung, top, bottom, schuhe) {
        this.kopfbedeckung = kopfbedeckung;
        this.top = top;
        this.bottom = bottom;
        this.schuhe = schuhe;
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    var fits = loadFits().then((fits) => {
        showFits(fits);
    });
});

function uploadFits(fits) {
    // Überprüfe, ob der Benutzer eingeloggt ist und hole die Benutzer-ID
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid; // Hole die Benutzer-ID
            const storagePath = `users/${userId}/Fits/fits.json`; // Speicherpfad für die Datei

            // JSON-File aus dem Array erstellen
            const fileContent = JSON.stringify(fits, null, 2); // Formatierte JSON-Daten
            const fileBlob = new Blob([fileContent], { type: 'application/json' }); // Blob aus JSON-Daten

            // Speicher-Referenz in Firebase
            const storageRef = ref(storage, storagePath);

            // Datei hochladen
            uploadBytes(storageRef, fileBlob)
                .then((snapshot) => {
                    console.log('Fit Datei erfolgreich hochgeladen!', snapshot);

                    // URL der hochgeladenen Datei abrufen
                    getDownloadURL(storageRef)
                        .then((url) => {
                            console.log('Datei-URL:', url);
                        })
                        .catch((error) => {
                            console.error('Fehler beim Abrufen der URL:', error);
                            showAlert('Error getting file URL: ' + error.message, 'error');
                            return false;
                        });
                })
                .catch((error) => {
                    console.error('Fehler beim Hochladen der Datei:', error);
                    showAlert('Error uploading file: ' + error.message, 'error');
                    return false;
                });
        } else {
            showAlert('Please login first to upload clothes.', 'error');
            return false;
        }
    });
    return true;
}

async function loadFits() {
    return new Promise((resolve, reject) => {
        // Überprüfe, ob der Benutzer eingeloggt ist
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid; // Benutzer-ID holen
                const storagePath = `users/${userId}/Fits/fits.json`; // Speicherpfad zur Datei

                // Speicher-Referenz in Firebase
                const storageRef = ref(storage, storagePath);

                try {
                    // Datei-URL abrufen
                    const url = await getDownloadURL(storageRef);

                    // JSON-Datei von der URL abrufen
                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
                    }

                    // JSON-Inhalt in ein Array umwandeln
                    const fitsData = await response.json();

                    // Daten zu Fit-Objekten umwandeln
                    const fits = fitsData.map(fit => new Fit(fit.kopfbedeckung, fit.top, fit.bottom, fit.schuhe));

                    console.log('Erfolgreich Fits geladen:', fits);
                    resolve(fits); // Array von Fit-Objekten zurückgeben
                } catch (error) {
                    console.error('Fehler beim Laden der Fits:', error);
                    showAlert('Error loading fits: ' + error.message, 'error');
                    reject(error); // Fehler weitergeben
                }
            } else {
                showAlert('Please login first to load clothes.', 'error');
                reject(new Error('User not logged in')); // Fehler zurückgeben
            }
        });
    });
}

function removeFit(fits, index) {
    var fitsNew = fits.splice(index, 1);
    uploadFits(fitsNew);
    showFits(fitsNew);
}
function uploadSingleFit() {
    var top = document.getElementById('head-container'); // Der Container
    var img = top.querySelector('img'); // Sucht das erste <img> im Container
    var imgSrc = img.getAttribute('src'); // Holt den Wert des src-Attributs
    console.log(imgSrc);

    var fits = loadFits();
    fits.push(fit);
    uploadFits(fits);
}

function showFits(fits) {
    var i = 0;
    for (const fit of fits){
        i++;
        // const fitsContainer = document.getElementById('fitsC');
        const container = document.querySelector('.gridContainer');
        container.innerHTML = container.innerHTML + `
        <div class="itembox" id="${i}">
        <button class="close-btn">
            <img src="../.Content/Icons/x-button.png" onclick="${removeFit(i)}">
        </button>
            <div class="fitItemContainer">
                <div class="fitPart" id="head-container">
                    <img src="${fit.kopfbedeckung}" alt="Head" class="fit-image">
                </div>
                <div class="fitPart" id="top-container">
                    <img src="${fit.top}" alt="Top" class="fit-image">
                </div>
                <div class="fitPart" id="bottom-container">
                    <img src="${fit.bottom}" alt="Bottom" class="fit-image">
                </div>
                <div class="fitPart" id="shoes-container">
                    <img src="${fit.schuhe}" alt="Shoes" class="fit-image">
                </div>
            </div>
        </div>
    `;
        const closeButton = document.querySelector('.close-btn');
        // Event-Listener für den "Löschen"-Button
        closeButton.addEventListener('click', () => {
            // Bestätigen, ob der Benutzer das Bild wirklich löschen möchte
            if (confirm('Möchtest du dieses Bild wirklich löschen?')) {
                //TODO: Fit aus Firebase Storage löschen
            }
        });
    }
}

// Hilfsfunktionen

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