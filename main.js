let worksheetData = [];
let simulasiData = [];
let currentTab = 'worksheet';
let currentPage = 1;
let itemsPerPage = 12;
let filteredData = [];
let currentCategory = 'semua';
let dataLoaded = { worksheet: false, simulasi: false };

document.addEventListener('DOMContentLoaded', function() {
    showTab('worksheet');
    setupEventListeners();
});

async function fetchData(type) {
    let url = type === 'worksheet' ? 'worksheet.json' : 'simulasi.json';
    const response = await fetch(url);
    const json = await response.json();
    if (type === 'worksheet') worksheetData = json;
    else simulasiData = json;
    dataLoaded[type] = true;
    if (currentTab === type) loadContent();
}

function setupEventListeners() {
    document.getElementById('mobile-menu-btn').addEventListener('click', function() {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.toggle('hidden');
    });

    document.getElementById('search-input').addEventListener('input', function() {
        currentPage = 1;
        loadContent();
    });

    document.getElementById('help-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendWhatsAppMessage();
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function showTab(tab) {
    currentTab = tab;
    currentPage = 1;
    currentCategory = 'semua';

    document.getElementById('tab-worksheet').className = tab === 'worksheet' ? 'tab-active px-8 py-4 rounded-lg font-semibold text-lg transition-all' : 'tab-inactive px-8 py-4 rounded-lg font-semibold text-lg transition-all ml-2';
    document.getElementById('tab-simulasi').className = tab === 'simulasi' ? 'tab-active px-8 py-4 rounded-lg font-semibold text-lg transition-all ml-2' : 'tab-inactive px-8 py-4 rounded-lg font-semibold text-lg transition-all ml-2';

    updateCategoryButtons();

    document.getElementById('search-input').value = '';

    if (!dataLoaded[tab]) {
        fetchData(tab);
    } else {
        loadContent();
    }

    document.getElementById('content-gallery').scrollIntoView({
        behavior: 'smooth'
    });
}

function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    updateCategoryButtons();
    loadContent();
}

function updateCategoryButtons() {
    const categories = ['semua', 'matematika', 'ipa', 'bahasa', 'ips'];
    categories.forEach(cat => {
        const button = document.getElementById(`filter-${cat}`);
        if (button) {
            button.className = cat === currentCategory
                ? 'category-filter-active px-6 py-3 rounded-lg font-semibold transition-all'
                : 'category-filter-inactive px-6 py-3 rounded-lg font-semibold transition-all';
        }
    });
}

function loadContent() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const data = currentTab === 'worksheet' ? worksheetData : simulasiData;

    filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) ||
                            item.description.toLowerCase().includes(searchTerm) ||
                            item.keywords.toLowerCase().includes(searchTerm);

        const matchesCategory = currentCategory === 'semua' || item.category === currentCategory;

        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredData.slice(startIndex, endIndex);

    renderContent(currentItems, searchTerm);
    renderPagination(totalPages);
}

function renderContent(items, searchTerm) {
    const grid = document.getElementById('content-grid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-500 mb-2">Tidak ada hasil</h3>
                <p class="text-gray-400">Coba kata kunci yang berbeda</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const card = createContentCard(item, searchTerm);
        grid.appendChild(card);
    });
}

function createContentCard(item, searchTerm) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-lg overflow-hidden card-hover cursor-pointer';
    card.onclick = () => window.open(item.url, '_blank');

    let title = item.title;
    let description = item.description;

    if (searchTerm) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        title = title.replace(regex, '<span class="search-highlight">$1</span>');
        description = description.replace(regex, '<span class="search-highlight">$1</span>');
    }

    card.innerHTML = `
        <div class="p-6 text-center">
            <div class="mb-4 flex justify-center">${item.thumbnail}</div>
            <h3 class="text-xl font-bold mb-3 text-gray-800 h-14 flex items-center justify-center">${title}</h3>
            <p class="text-gray-600 text-sm mb-6 h-12">${description}</p>
            <div class="bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                <i class="fas fa-external-link-alt"></i>
                <span>Buka</span>
            </div>
        </div>
    `;

    return card;
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        const prevBtn = createPaginationButton('❮', currentPage - 1);
        pagination.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const pageBtn = createPaginationButton(i, i, i === currentPage);
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const dots = document.createElement('span');
            dots.className = 'px-3 py-2 text-gray-500';
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
    }

    if (currentPage < totalPages) {
        const nextBtn = createPaginationButton('❯', currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

function createPaginationButton(text, page, isActive = false) {
    const button = document.createElement('button');
    button.className = `pagination-btn px-4 py-2 rounded-lg font-semibold ${
        isActive
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
    }`;
    button.textContent = text;
    button.onclick = () => {
        currentPage = page;
        loadContent();
        document.querySelector('.max-w-4xl.mx-auto.mb-8').scrollIntoView({
            behavior: 'smooth'
        });
    };
    return button;
}

function sendWhatsAppMessage() {
    const nama = document.getElementById('nama').value;
    const kelas = document.getElementById('kelas').value;
    const jenis = document.querySelector('input[name="jenis"]:checked').value;
    const materi = document.getElementById('materi').value;

    const message = `Halo ED-Share!

Nama: ${nama}
Kelas: ${kelas}
Jenis Permintaan: ${jenis}

Materi/Topik yang diminta:
${materi}

Terima kasih!`;

    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function showQRIS() {
    document.getElementById('qris-modal').classList.remove('hidden');
}

function closeQRISModal() {
    document.getElementById('qris-modal').classList.add('hidden');
}

document.getElementById('qris-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeQRISModal();
    }
});