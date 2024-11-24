import { storage } from '../Firebase/Fire.js';
import {
    ref,
    getDownloadURL,
    uploadBytes, ref as storageRef, getStorage, deleteObject
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { auth } from '../Firebase/Fire.js';
import { showAlert } from '../Homepage/index.js';

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
    var fitsNew = fits.filter((fit, fitIndex) => fitIndex !== index);
    uploadFits(fitsNew);
    showFits(fitsNew);
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