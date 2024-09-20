// Globale Variablen

let tempFiles = [];
let selectionMap = new Map();

function initDragDrop(){
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
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

// Dateien verarbeiten und zur Liste hinzufügen
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
    tempFiles = files;
}

// Next Button
function showfiles() {
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
                if (selectionMap.size === tempFiles.length) {
                    document.getElementById('saveButton').disabled = false;
                }
            });
        });
    });

}

function saveFiles() {
    console.log("saveFiles() called");
    // TODO: Daten an DB senden
}

// Hilfsfunktionen

function createItemBox(file) {
    const id = CSS.escape(file.name);
    return `
        <div class="itembox" id="${id}">
            <button class="close-btn" onclick="deleteButton(\'${id}\')">
                <img src="../.Content/Icons/x-button.png" alt="Delete">
            </button>
            <img src="${URL.createObjectURL(file)}" alt="Clothing">
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
    tempFiles = tempFiles.filter(file => id = CSS.escape(file.name) !== id);
    if (tempFiles.length === initialLength) {
        console.warn(`Datei mit dem Namen ${id} wurde nicht in tempFiles gefunden.`);
    }

    console.log(`Element mit ID ${id} erfolgreich gelöscht.`);
}