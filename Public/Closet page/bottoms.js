import { ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { storage } from '../Firebase/Fire.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { deleteObject, ref as storageRef, getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { auth } from '../Firebase/Fire.js';
import { showAlert } from './closet.js';


function loadUserImages() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const categories = ['Bottoms'];
            categories.forEach(category => {
                const path = `users/${user.uid}/images/${category}/`;
                const storageRef = ref(getStorage(), path);

                listAll(storageRef).then((result) => {
                    result.items.forEach((itemRef) => {
                        getDownloadURL(itemRef).then((url) => {
                            displayImage(url, itemRef.name, category);
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
    closeButton.innerHTML = '<img src="../Content/Icons/x-button.png" alt=""/>';

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

export { loadUserImages };