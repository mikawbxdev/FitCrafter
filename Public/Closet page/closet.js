import { ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { storage } from '../Firebase/Fire.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { deleteObject, ref as storageRef, getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { auth } from '../Firebase/Fire.js';


function loadUserImages() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is logged in:', user.uid);
            const categories = ['Tops', 'Bottoms', 'Kopfbedeckung', 'Schuhe'];
            categories.forEach(category => {
                const path = `users/${user.uid}/images/${category}/`;
                const storageRef = ref(getStorage(), path);
                console.log('Checking path:', path);

                listAll(storageRef).then((result) => {
                    console.log(`Found ${result.items.length} items in ${category}`);
                    result.items.forEach((itemRef) => {
                        getDownloadURL(itemRef).then((url) => {
                            console.log('Displaying image from URL:', url);
                            displayImage(url, itemRef.name);
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



function displayImage(url, name) {
    const container = document.querySelector('.gridContainer');
    const itemBox = document.createElement('div');
    itemBox.className = 'itembox';

    const img = document.createElement('img');
    img.src = url;
    img.alt = name;

    const closeButton = document.createElement('button');
    closeButton.className = 'close-btn';
    closeButton.innerHTML = '<img src="/ContentIcons/x-button.png"/>';

    const text = document.createElement('div');
    text.className = 'itemtext';
    text.textContent = name;

    // Event-Listener für den "Löschen"-Button
    closeButton.addEventListener('click', () => {
        // Bestätigen, ob der Benutzer das Bild wirklich löschen möchte
        if (confirm('Möchtest du dieses Bild wirklich löschen?')) {
            // Bild aus Firebase Storage löschen
            const storageReference = storageRef(getStorage(), `users/${auth.currentUser.uid}/images/${category}/${name}`);

            console.log('Versuche, das Bild zu löschen:', storageReference.fullPath);

            deleteObject(storageReference).then(() => {
                console.log('Bild erfolgreich gelöscht:', name);
                // Bild aus dem DOM entfernen
                container.removeChild(itemBox);
            }).catch((error) => {
                console.error('Fehler beim Löschen des Bildes:', error);
                alert('Fehler beim Löschen des Bildes. Überprüfe die Konsole für Details.');
            });
        }
    });

    itemBox.appendChild(closeButton);
    itemBox.appendChild(img);
    itemBox.appendChild(text);
    container.appendChild(itemBox);
}



// Funktion zum Löschen eines Bildes aus Firebase Storage
function deleteImage(imagePath) {
    const imageRef = ref(storage, imagePath);

    deleteObject(imageRef).then(() => {
        console.log('Bild erfolgreich gelöscht');
    }).catch((error) => {
        console.error('Fehler beim Löschen des Bildes:', error);
    });
}
export { loadUserImages };
