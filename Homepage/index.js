// Zugriffsberechtigung prüfen
window.onload = function() {
    const userLoggedIn = sessionStorage.getItem('userLoggedIn');

    if (userLoggedIn !== 'true') {
        showAlert('Bitte einloggen, um diese Seite zu sehen.', 'error');
        setTimeout(() => {
            window.location.href = '../Account page/account.html';
        }, 1000);
    }
};