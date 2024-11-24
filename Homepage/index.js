import { ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { storage } from '../Firebase/Fire.js';
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { storage } from '../Firebase/Fire.js';
import {
    ref,
    getDownloadURL,
    uploadBytes
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

const auth = getAuth();

// Funktion zum Anzeigen des Auswahlbereichs
function showSelectionView(category) {
    // Verstecke die Homepage
    document.getElementById('homepage').style.display = 'none';

    // Verstecke alle Auswahlbereiche
    const selectionViews = document.getElementsByClassName('selectionView');
    for (let i = 0; i < selectionViews.length; i++) {
        selectionViews[i].style.display = 'none';
    }

    // Zeige den ausgewählten Auswahlbereich
    const selectionViewId = `${category}-selection`;
    document.getElementById(selectionViewId).style.display = 'block';

    // Lade die Items für die ausgewählte Kategorie
    loadCategoryItems(category);
}

// Funktion zum Laden der Items für eine Kategorie
function loadCategoryItems(category) {
    const gridId = `${category}-grid`;
    const gridContainer = document.getElementById(gridId);
    gridContainer.innerHTML = ''; // Vorherige Items löschen

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const path = `users/${user.uid}/images/${capitalizeFirstLetter(category)}/`;
            const storageRef = ref(storage, path);

            listAll(storageRef).then((result) => {
                result.items.forEach((itemRef) => {
                    getDownloadURL(itemRef).then((url) => {
                        displayItem(url, itemRef.name, category, gridContainer);
                    });
                });
            }).catch((error) => {
                console.error(`Fehler beim Laden der Bilder für ${category}:`, error);
            });
        } else {
            console.log("User not logged in.");
        }
    });
}

function displayItem(url, name, category, container) {
    const itemBox = document.createElement('div');
    itemBox.className = 'itembox';

    const img = document.createElement('img');
    img.src = url;
    img.alt = name;

    // Beim Klicken auf das Bild wird das Item ausgewählt
    img.addEventListener('click', () => {
        selectItem(url, category);
    });

    // Optional: Text unter dem Bild
    const itemText = document.createElement('div');
    itemText.className = 'itemtext';
    itemText.textContent = name;

    itemBox.appendChild(img);
    itemBox.appendChild(itemText); // Falls verwendet
    container.appendChild(itemBox);
}

// Funktion zur Auswahl eines Items
function selectItem(url, category) {
    // Aktualisiere die Anzeige auf der Homepage
    let containerId = '';
    switch (category) {
        case 'kopfbedeckung':
            containerId = 'head-container';
            break;
        case 'tops':
            containerId = 'top-container';
            break;
        case 'bottoms':
            containerId = 'bottom-container';
            break;
        case 'schuhe':
            containerId = 'shoes-container';
            break;
    }

    if (containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const img = document.createElement('img');
        img.src = url;
        container.appendChild(img);
    }

    // Zeige die Homepage wieder an
    showHomePage();
}

// Funktion zum Anzeigen der Homepage
function showHomePage() {
    // Verstecke alle Auswahlbereiche
    const selectionViews = document.getElementsByClassName('selectionView');
    for (let i = 0; i < selectionViews.length; i++) {
        selectionViews[i].style.display = 'none';
    }

    // Zeige die Homepage
    document.getElementById('homepage').style.display = 'flex';
}

// Hilfsfunktion zur Großschreibung des ersten Buchstabens
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Funktionen global verfügbar machen
window.showSelectionView = showSelectionView;

// Funktion zum Überprüfen, ob ein Benutzer eingeloggt ist
function checkUserLoggedIn() {
    const userLoggedIn = sessionStorage.getItem('userLoggedIn');
    if (userLoggedIn !== 'true') {
        console.log('Bitte einloggen, um diese Seite zu sehen.');
        setTimeout(() => {
            window.location.href = '../Account page/account.html';
        }, 1000);
    }
}

// Funktion zum Laden zufälliger Bilder für die Startseite
function loadRandomImage(category, containerId) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const path = `users/${user.uid}/images/${category}/`;
            const storageRef = ref(storage, path);

            listAll(storageRef).then((result) => {
                if (result.items.length > 0) {
                    const randomIndex = Math.floor(Math.random() * result.items.length);
                    const itemRef = result.items[randomIndex];

                    getDownloadURL(itemRef).then((url) => {
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

// Funktion zum Mischen des Outfits
function shuffleOutfit() {
    loadRandomImage('Kopfbedeckung', 'head-container');
    loadRandomImage('Tops', 'top-container');
    loadRandomImage('Bottoms', 'bottom-container');
    loadRandomImage('Schuhe', 'shoes-container');
}



// Funktionen für globale Verfügbarkeit
window.shuffleOutfit = shuffleOutfit;

// Event Listener für den Shuffle-Button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('shuffle-button').addEventListener('click', shuffleOutfit);
});

// Beim Laden der Seite
window.onload = function() {
    checkUserLoggedIn();
    // Lade die zufälligen Bilder für die Startseite
    loadRandomImage('Kopfbedeckung', 'head-container');
    loadRandomImage('Tops', 'top-container');
    loadRandomImage('Bottoms', 'bottom-container');
    loadRandomImage('Schuhe', 'shoes-container');
};

class Fit {
    constructor(kopfbedeckung, top, bottom, schuhe) {
        this.kopfbedeckung = kopfbedeckung;
        this.top = top;
        this.bottom = bottom;
        this.schuhe = schuhe;
    }
}
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

function uploadSingleFit() {
    var top = document.getElementById('head-container'); // Der Container
    var img = top.querySelector('img'); // Sucht das erste <img> im Container
    var imgSrc = img.getAttribute('src'); // Holt den Wert des src-Attributs
    console.log(imgSrc);

    var fits = loadFits();
    fits.push(fit);
    uploadFits(fits);
}