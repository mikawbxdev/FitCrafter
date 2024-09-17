const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

// Globale Variablen

let tempFiles = [];

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

// Dateien verarbeiten und zur Liste hinzufügen
function handleFiles(files) {
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

    for (let i = 0; i < tempFiles.length; i++) {
        const file = tempFiles[i];
        const fileItem = document.createElement('p');
        // fileItem.textContent = `File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        fileList.appendChild(fileItem);
    }
}


