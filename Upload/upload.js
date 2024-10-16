import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
// Importiere die auth und storage Konfiguration aus der fire.js-Datei
import { auth, storage } from '../Firebase/fire.js';
import {
    getStorage,
    ref,
    uploadBytes,
    listAll,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

console.log('upload.js wurde geladen');

// Globale Variablen

const apiKeys = ["Y5giVpqK82LETwzZ86jQJxQ3", "DhZEkW9QfcFQnGR1ujeAtchZ", "E4betQAzJP4mx9xK7nZ9Yi93", "fvsX9KAtHVdHjPzsyDWDXaLM"] // E4betQAzJP4mx9xK7nZ9Yi93 mit meinem google acc
let tempFiles = [];
let tempFiles2 = [];
let selectionMap = new Map();

window.onload = function() {
    // Funktion zum Initialisieren von Drag & Drop
    initDragDrop();
};

function initDragDrop() {
    const dropArea = document.getElementById('uploadBox');

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('highlight');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('highlight');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('highlight');
        const files = event.dataTransfer.files;
        handleFiles(files); // Ruft die Funktion auf, um die Dateien zu verarbeiten
    });
}


// Wenn der Nutzer eine Datei auswählt
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag & Drop für uploadBox
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
}); // <- Dies schließt den Block korrekt


// Files umbennen und next button sichtbar machen
function handleFiles(files) {
    const fileList = document.getElementById('fileList');

    fileList.innerHTML = ''; // Leere die Liste vor jeder neuen Auswahl
    const fileItem = document.createElement('p');
    if (files.length > 1) {
        fileItem.textContent = files.length + ' Files uploaded.'
    } else if (files.length === 1) {
        fileItem.textContent = files.length + ' File uploaded.'
    } else {
        fileItem.textContent = 'No Files selected.'
    }
    fileList.appendChild(fileItem);
    document.getElementById('nextButton').disabled = false;
    tempFiles = Array.from(files).map(file => {
        const hash = getHashCode(file.name);
        const extension = file.name.split('.').pop(); // Hol die Dateierweiterung
        return new File([file], `${hash}.${extension}`, { type: file.type });
    });
}
console.log("davor");
// Next Button Funktion
function showFiles() {
    console.log("showFiles wurde aufgerufen");
    removeBG();
    const middlecontainer = document.getElementById('middlecontainer');
    const middlecontainer2 = document.getElementById('middlecontainer2');
    const uploadContainer2 = document.getElementById('uploadContainer2');
    // let selectionMap = new Map();
    let itemBoxesHtml = '';
    middlecontainer.style.display = 'none';
    middlecontainer2.style.display = 'flex';

    for (let i = 0; i < tempFiles.length; i++) {
        itemBoxesHtml += createItemBox(tempFiles[i]);
    }
    uploadContainer2.innerHTML = itemBoxesHtml;

    // Logik für Auswahl speichern
    document.querySelectorAll('.itembox').forEach(itembox => {
        const buttons = itembox.querySelectorAll('.select-button');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Entferne die Klasse "selected" nur von den Buttons in dieser itembox
                buttons.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                const selection = this.getAttribute('data-selection');
                selectionMap.set(itembox.id, selection);
                console.log(selectionMap);
                if (selectionMap.size === tempFiles.length && tempFiles.length === tempFiles2.length) {
                    document.getElementById('saveButton').disabled = false;
                }
            });
        });
    });
}
console.log("danach");

async function removeBG() {
    const formData = new FormData();
    const results = [];
    let croppedFile;

    for (const file of tempFiles) {
        formData.append("size", "auto");
        formData.append("crop", "true");
        formData.append("image_file", file);

        try {
            const response = await fetch("https://api.remove.bg/v1.0/removebg", {
                method: "POST",
                headers: {
                    "X-Api-Key": apiKeys[2],
                },
                body: formData,
            });
            console.log("Request sent");
            console.log(response.body);
            if (response.ok) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                tempFiles2.push(new File([blob], file.name, {type: blob.type}));
                document.getElementById(file.name).querySelector('#img').src = imageUrl;
                results.push(imageUrl);
            } else {
                const errorText = await response.text();
                throw new Error(`${response.status}: ${response.statusText} : ${response.body} : ${errorText}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    // Falls Auswahl schon vor Beenden dieser Funktion getroffen wurde
    if (selectionMap.size === tempFiles.length && tempFiles.length === tempFiles2.length) {
        document.getElementById('saveButton').disabled = false;
    }
}

function saveFiles() {
    console.log("saveFiles() wurde aufgerufen");

    tempFiles2.forEach((file) => {
        uploadFile(file); // Jede Datei zu Firebase hochladen
    });

    showAlert("Alle Dateien wurden erfolgreich hochgeladen!", "success");
}


// Hilfsfunktionen

function createItemBox(file) {
    return `
        <div class="itembox" id="${file.name}">
            <button class="close-btn" onclick="deleteButton(\'${file.name}\')">
                <img src="../.Content/Icons/x-button.png" alt="Delete">
            </button>
            <img id='img' src="${URL.createObjectURL(file)}" alt="Clothing">
            <div class="icon-selection">
                <button class="select-button" data-selection="Kopfbedeckung">
                    <img src="../.Content/Icons/Kopf.png" alt="Kopfbedeckung">
                </button>
                <button class="select-button" data-selection="Tops">
                    <img src="../.Content/Icons/Körper.png" alt="Tops">
                </button>
                <button class="select-button" data-selection="Bottoms">
                    <img src="../.Content/Icons/Hose.png" alt="Bottoms">
                </button>
                <button class="select-button" data-selection="Schuhe">
                    <img src="../.Content/Icons/Schuh.png" alt="Schuhe">
                </button>
            </div>
        </div>
    `;
}
function deleteButton(id) {
    console.log(tempFiles);
    const itembox = document.getElementById(id);
    if (!itembox) {
        console.warn(`Element mit ID ${id} wurde nicht gefunden.`);
        return;
    }
    itembox.remove();

    if (selectionMap.has(id)) {
        selectionMap.delete(id);
    } else {
        console.warn(`ID ${id} war nicht in der selectionMap.`);
    }

    const initialLength = tempFiles.length;
    let idx = tempFiles.indexOf(id);
    tempFiles.splice(idx, 1);
    let idx2 = tempFiles.indexOf(id);
    tempFiles2.splice(idx, 1);
    if (tempFiles.length === initialLength) {
        console.warn(`Datei mit dem Namen ${id} wurde nicht in tempFiles gefunden.`);
    }
    console.log(`Element mit ID ${id} erfolgreich gelöscht.`);
    if (tempFiles.length === 0) {
        window.history.back();
    }
}

function getHashCode(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return '_' + hash;
}

// Firebase
function uploadFile(file) {
    // Überprüfe, ob der Benutzer eingeloggt ist und hole die Benutzer-ID
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid; // Hole die Benutzer-ID
            const storageRef = ref(storage, `users/${userId}/images/${file.name}`); // Pfad in Firebase Storage für jeden Benutzer
            uploadBytes(storageRef, file)
                .then((snapshot) => {
                    console.log('Datei erfolgreich hochgeladen!', snapshot);
                    showAlert('Datei erfolgreich hochgeladen!', 'success');

                    // URL der hochgeladenen Datei abrufen
                    getDownloadURL(storageRef).then((url) => {
                        console.log('Bild-URL:', url);
                        showAlert(`Bild erfolgreich hochgeladen! URL: ${url}`, 'success');
                    }).catch((error) => {
                        console.error('Fehler beim Abrufen der URL:', error);
                        showAlert('Fehler beim Abrufen der URL: ' + error.message, 'error');
                    });
                })
                .catch((error) => {
                    console.error('Fehler beim Hochladen der Datei:', error);
                    showAlert('Fehler beim Hochladen der Datei: ' + error.message, 'error');
                });
        } else {
            showAlert('Bitte einloggen, um Dateien hochzuladen.', 'error');
        }
    });
}



function listFiles() {
    const storageRef = ref(storage, 'files/'); // Pfad zu den Dateien in Firebase Storage
    listAll(storageRef)
        .then((result) => {
            result.items.forEach((itemRef) => {
                // Hier kannst du die Datei-URLs abrufen
                getDownloadURL(itemRef)
                    .then((url) => {
                        console.log('File URL:', url);
                        // Hier kannst du die URL weiterverarbeiten, z.B. in der Benutzeroberfläche anzeigen
                    })
                    .catch((error) => {
                        console.error('Error getting file URL:', error);
                    });
            });
        })
        .catch((error) => {
            console.error('Error listing files:', error);
        });
}
window.showFiles = showFiles;
console.log("showFiles ist Global")


