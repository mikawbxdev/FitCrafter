import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
// Importiere die auth und storage Konfiguration aus der fire.js-Datei
import { auth, storage } from '../Firebase/fire.js';
import {
    getStorage,
    ref,
    uploadBytes,
    listAll,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { showAlert } from '../Homepage/index.js';

console.log('upload.js wurde geladen');

// Globale Variablen

const apiKeys = ["fvsX9KAtHVdHjPzsyDWDXaLM", "HW2qBanSb8u2HntfRdCt1edg", "Xxofi4HxsY6NfzX6fdTT4rf9", "a8YboSZFEUpEDoWq2w8RMKEp", "cusAS6Aqwe67gFvvNtsFB1vN", "YCmhJMz3yKrwmsYVj3phLZZq", "QL4VeXC8U8aXH2ecqX6XgkpD" ] // E4betQAzJP4mx9xK7nZ9Yi93 mit meinem google acc
let tempFiles = [];
let tempFiles2 = [];
let selectionMap = new Map();

window.onload = function() {
    // Funktion zum Initialisieren von Drag & Drop
    initDragDrop();
};

function initDragDrop(){
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    // Click to upload
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

// Wenn der Nutzer eine Datei auswählt
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

// Drag & Drop
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
    });
}

// Files umbennen und next button sichtbar machen
function handleFiles(files) {
    const fileList = document.getElementById('fileList');

    fileList.innerHTML = ''; // Leere die Liste vor jeder neuen Auswahl
    const fileItem = document.createElement('p');
    // files.forEach(file => {
    //     if (file.type.split('/')[0] !== 'image') {
    //         showAlert('1 File removed: Only image files are allowed!', 'error');
    //     }
    // });

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
// Next Button Funktion
function showFiles() {
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
async function removeBG() {
    const formData = new FormData();
    const results = [];

    for (const file of tempFiles) {
        formData.append("size", "auto");
        formData.append("crop", "true");
        formData.append("image_file", file);

        try {
            const response = await fetch("https://api.remove.bg/v1.0/removebg", {
                method: "POST",
                headers: {
                    "X-Api-Key": apiKeys[0],
                },
                body: formData,
            });
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
    var success = true;
    tempFiles2.forEach((file) => { // Jede Datei zu Firebase hochladen
        if (!uploadFile(file)) {
            success = false;
        }
    });
    console.log(success);
    if (success) {
        showAlert("Your clothes were successfully uploaded!", "success");
        setTimeout(() => {
            window.location.href = '../Closet page/closet.html';
        }, 2000);
    }
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
            var storageRef;
            switch (selectionMap.get(file.name)) {
                case 'Kopfbedeckung':
                    storageRef = ref(storage, `users/${userId}/images/Kopfbedeckung/${selectionMap.get(file.name)}_${file.name}`);
                    break
                case 'Tops':
                    storageRef = ref(storage, `users/${userId}/images/Tops/${selectionMap.get(file.name)}_${file.name}`);
                    break
                case 'Bottoms':
                    storageRef = ref(storage, `users/${userId}/images/Bottoms/${selectionMap.get(file.name)}_${file.name}`);
                    break
                case 'Schuhe':
                    storageRef = ref(storage, `users/${userId}/images/Schuhe/${selectionMap.get(file.name)}_${file.name}`);
                    break
            }
            uploadBytes(storageRef, file)
                .then((snapshot) => {
                    console.log('Datei erfolgreich hochgeladen!', snapshot);
                    // URL der hochgeladenen Datei abrufen
                    getDownloadURL(storageRef).then((url) => {
                        console.log('Bild-URL:', url);
                    }).catch((error) => {
                        console.error('Fehler beim Abrufen der URL:', error);
                        showAlert('Error getting image URL: ' + error.message, 'error');
                        return false
                    });
                })
                .catch((error) => {
                    console.error('Fehler beim Hochladen der Datei:', error);
                    showAlert('Error uploading file: ' + error.message, 'error');
                    return false
                });
        } else {
            showAlert('Please login first to upload clothes.', 'error');
            return false;
        }
    });
    return true;
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
window.saveFiles = saveFiles;
window.deleteButton = deleteButton;



