// URL de la API - Cambiar según corresponda (Producción o Local)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api/canciones' 
    : 'https://api-canciones-yf16.onrender.com/api/canciones';

const songsContainer = document.getElementById('songsContainer');
const selectionBar = document.getElementById('selectionBar');
const selectedCountText = document.getElementById('selectedCount');

let selectedIds = new Set();
let allSongs = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchSongs();

    // Configurar botón de Spotify dinámicamente
    const btnSpotify = document.getElementById('btnSpotify');
    if (btnSpotify) {
        const LOGIN_URL = API_URL.replace('/canciones', '/spotify/login');
        btnSpotify.onclick = () => window.location.href = LOGIN_URL;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('import') === 'success') {
        const count = urlParams.get('count') || '0';
        showToast(`¡Se han importado ${count} canciones correctamente!`);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get('error')) {
        const msg = urlParams.get('msg') || 'Error desconocido';
        alert('Error de Spotify: ' + decodeURIComponent(msg));
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Event Listeners para Filtros
document.getElementById('filterFavoritas').addEventListener('change', fetchSongs);
document.getElementById('searchSong').addEventListener('input', debounce(fetchSongs, 500));

// Obtener Canciones
async function fetchSongs() {
    try {
        const favoritas = document.getElementById('filterFavoritas').checked;
        const search = document.getElementById('searchSong').value;
        
        let query = new URLSearchParams();
        if (favoritas) query.append('favoritas', 'on');
        if (search) query.append('search', search);

        const res = await fetch(`${API_URL}?${query.toString()}`);
        allSongs = await res.json();
        
        renderSongs(allSongs);
    } catch (error) {
        console.error(error);
        songsContainer.innerHTML = '<div class="alert alert-danger w-100 text-center">Error al conectar con la API.</div>';
    }
}

// Renderizar Canciones
function renderSongs(canciones) {
    if (canciones.length === 0) {
        songsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-music fa-3x mb-3 text-muted"></i>
                <h5 class="text-muted">No se encontraron canciones</h5>
            </div>`;
        return;
    }

    songsContainer.innerHTML = canciones.map(c => {
        const isSelected = selectedIds.has(c.id);
        const imageStyle = c.imagen_url ? `background-image: url('${c.imagen_url}'); background-size: cover; background-position: center;` : '';
        
        return `
        <div class="col-md-6 col-lg-4">
            <div class="card song-card ${isSelected ? 'selected' : ''}" id="card-${c.id}">
                <div class="select-checkbox" onclick="toggleSelection(${c.id}, event)">
                    <i class="fas fa-check"></i>
                </div>
                <div class="card-img-top" style="${imageStyle}">
                    ${c.imagen_url ? '' : '<i class="fas fa-compact-disc"></i>'}
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="song-title text-truncate" title="${c.cancion}">${c.cancion}</h5>
                        <i class="fas fa-star favorite-star ${c.favorita ? 'active' : ''}" onclick="toggleFavorite(${c.id}, event)"></i>
                    </div>
                    <p class="song-artist text-truncate mb-3">${c.artista}</p>
                    
                    <div class="d-flex justify-content-end align-items-center mt-auto">
                        <div class="actions">
                            <button class="btn btn-sm text-danger" onclick="deleteSong(${c.id}, event)" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
}

// Selección Múltiple
window.toggleSelection = function(id, event) {
    if (event) event.stopPropagation();
    
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
        document.getElementById(`card-${id}`).classList.remove('selected');
    } else {
        selectedIds.add(id);
        document.getElementById(`card-${id}`).classList.add('selected');
    }
    
    updateSelectionBar();
}

function updateSelectionBar() {
    const count = selectedIds.size;
    selectedCountText.textContent = count;
    
    if (count > 0) {
        selectionBar.classList.add('active');
    } else {
        selectionBar.classList.remove('active');
    }
}

document.getElementById('btnCancelSelection').addEventListener('click', () => {
    selectedIds.clear();
    updateSelectionBar();
    renderSongs(allSongs);
});

// Acciones Masivas
document.getElementById('btnBulkDelete').addEventListener('click', async () => {
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.size} canciones?`)) return;
    
    try {
        await fetch(`${API_URL}/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedIds) })
        });
        selectedIds.clear();
        updateSelectionBar();
        fetchSongs();
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('btnBulkFavorite').addEventListener('click', () => bulkUpdateFavorite(true));
document.getElementById('btnBulkUnfavorite').addEventListener('click', () => bulkUpdateFavorite(false));

async function bulkUpdateFavorite(status) {
    try {
        await fetch(`${API_URL}/bulk-favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ids: Array.from(selectedIds),
                favorita: status
            })
        });
        selectedIds.clear();
        updateSelectionBar();
        fetchSongs();
    } catch (error) {
        console.error(error);
    }
}

// Funciones Individuales
async function toggleFavorite(id, event) {
    if (event) event.stopPropagation();
    try {
        await fetch(`${API_URL}/${id}/favorita`, { method: 'PATCH' });
        fetchSongs();
    } catch (error) {
        console.error(error);
    }
}

async function deleteSong(id, event) {
    if (event) event.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta canción?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchSongs();
    } catch (error) {
        console.error(error);
    }
}

// Utils
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function showToast(message) {
    alert(message);
}
