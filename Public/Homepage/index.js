import { ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { storage } from '../Firebase/fire.js';
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    uploadBytes
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { loadFits, uploadFits } from '../Fits page/fits.js';
const auth = getAuth();
// Beim Laden der Seite
window.onload = function() {
    checkUserLoggedIn();
    const urlParams = new URLSearchParams(window.location.search);
    const fitId = urlParams.get('fit'); // Gibt den Wert des Parameters 'fit' zurück

    if (fitId) {
        // Wenn der Parameter existiert, lade den entsprechenden Fit
        loadFitById(fitId);
        window.history.pushState({}, '', "/"); // Aktualisiert die URL, ohne die Seite neu zu laden

    } else {
        // Lade die zufälligen Bilder für die Startseite
        loadRandomImage('Kopfbedeckung', 'head-container');
        loadRandomImage('Tops', 'top-container');
        loadRandomImage('Bottoms', 'bottom-container');
        loadRandomImage('Schuhe', 'shoes-container');
    }
};

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

    itemBox.appendChild(img);
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

function loadFitById (fitString64) {
    fitString64 = JSON.parse(atob(fitString64));
    console.log('Fit loaded:', [fitString64.kopfbedeckung, fitString64.top, fitString64.bottom, fitString64.schuhe]);

    [fitString64.kopfbedeckung, fitString64.top, fitString64.bottom, fitString64.schuhe].forEach((url, index) => {
        const category = ['head', 'top', 'bottom', 'shoes'][index];
        const container = document.getElementById(`${category}-container`);
        // container.innerHTML = null;
        const img = document.createElement('img');
        img.src = url;
        img.alt = category;
        container.appendChild(img);
    });
}

// Funktion zum Mischen des Outfits
function shuffleOutfit() {
    loadRandomImage('Kopfbedeckung', 'head-container');
    loadRandomImage('Tops', 'top-container');
    loadRandomImage('Bottoms', 'bottom-container');
    loadRandomImage('Schuhe', 'shoes-container');
}


class Fit {
    constructor(kopfbedeckung, top, bottom, schuhe) {
        this.kopfbedeckung = kopfbedeckung;
        this.top = top;
        this.bottom = bottom;
        this.schuhe = schuhe;
    }
}






function uploadSingleFit() {
// Hole das Bild für "top-container"
    const top = document.getElementById('top-container');
    const topImg = top.querySelector('img');
    const topSrc = topImg ? topImg.getAttribute('src') : null; // Stelle sicher, dass ein Bild vorhanden ist

// Hole das Bild für "head-container"
    const head = document.getElementById('head-container');
    const headImg = head.querySelector('img');
    const headSrc = headImg ? headImg.getAttribute('src') : null; // Stelle sicher, dass ein Bild vorhanden ist

// Hole das Bild für "bottom-container"
    const bottom = document.getElementById('bottom-container');
    const bottomImg = bottom.querySelector('img');
    const bottomSrc = bottomImg ? bottomImg.getAttribute('src') : null; // Stelle sicher, dass ein Bild vorhanden ist

// Hole das Bild für "shoes-container"
    const shoes = document.getElementById('shoes-container');
    const shoesImg = shoes.querySelector('img');
    const shoesSrc = shoesImg ? shoesImg.getAttribute('src') : null; // Stelle sicher, dass ein Bild vorhanden ist

// Erstelle das Fit-Objekt, wenn alle Bild-URLs vorhanden sind
    if (topSrc && headSrc && bottomSrc && shoesSrc) {
        const fit = new Fit(headSrc, topSrc, bottomSrc, shoesSrc);

        loadFits().then(fits => {
            // Sobald die Promise von loadFits aufgelöst ist und wir das Array haben,
            // können wir das fit-Objekt hinzufügen
            fits.push(fit);

            // Die Fits (mit dem neuen Fit) hochladen
            uploadFits(fits);
            showAlert("Successfully saved this fit", "success");
        }).catch(error => {
            showAlert("Error loading fits: " + error.message, "error");
        });
    } else {
        showAlert("Error uploading fit: Couldn't find fit data", "error");
    }

}

export function showAlert(message, type = 'success') {
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

window.uploadSingleFit = uploadSingleFit;
window.Fit = Fit;
window.shuffleOutfit = shuffleOutfit;