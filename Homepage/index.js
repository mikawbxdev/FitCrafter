// Zugriffsberechtigung prüfen
window.onload = function() {
    const userLoggedIn = sessionStorage.getItem('userLoggedIn');

    if (userLoggedIn !== 'true') {
        console.log('Bitte einloggen, um diese Seite zu sehen.');
        setTimeout(() => {
            window.location.href = '../Account page/account.html';
        }, 1000);
    }
};