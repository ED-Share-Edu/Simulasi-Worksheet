// Fungsi untuk load komponen HTML ke index.html
async function loadComponent(id, url) {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}

// Load semua komponen ke layout
window.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', 'components/header.html');
    loadComponent('hero', 'components/hero.html');
    loadComponent('tabs', 'components/tabs.html');
    loadComponent('content-grid', 'components/content-grid.html');
    loadComponent('services', 'components/services.html');
    loadComponent('footer', 'components/footer.html');
    loadComponent('modal-donation', 'components/modal-donation.html');
    loadComponent('modal-contact', 'components/modal-contact.html');
    // Setelah semua loaded, jalankan logic JS utama (render, filter, dsb)
});