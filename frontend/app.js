// URL de la API - Cambiar según corresponda (Producción o Local)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api/canciones' 
    : 'https://api-canciones-yf16.onrender.com/api/canciones';

const songsContainer = document.getElementById('songsContainer');
const songModal = new bootstrap.Modal(document.getElementById('songModal'));
const songForm = document.getElementById('songForm');
const modalTitle = document.getElementById('modalTitle');
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
        showToast('¡Canciones de Spotify importadas!');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Event Listeners para Filtros
document.getElementById('filterGenero').addEventListener('change', fetchSongs);
document.getElementById('filterFavoritas').addEventListener('change', fetchSongs);
document.getElementById('searchSong').addEventListener('input', debounce(fetchSongs, 500));

// Botón Nueva Canción
document.getElementById('btnNueva').addEventListener('click', () => {
    songForm.reset();
    document.getElementById('songId').value = '';
    modalTitle.textContent = 'Agregar Canción';
});

// Guardar Canción (Crear/Editar)
songForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('songId').value;
    const data = {
        cancion: document.getElementById('songName').value,
        artista: document.getElementById('songArtist').value,
        genero: document.getElementById('songGenre').value,
        favorita: document.getElementById('songFavorite').checked
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;
        
        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        songModal.hide();
        fetchSongs();
    } catch (error) {
        console.error(error);
        alert('Error al guardar la canción');
    }
});

// Obtener Canciones
async function fetchSongs() {
    try {
        const genero = document.getElementById('filterGenero').value;
        const favoritas = document.getElementById('filterFavoritas').checked;
        const search = document.getElementById('searchSong').value;
        
        let query = new URLSearchParams();
        if (genero) query.append('genero', genero);
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
        return `
        <div class="col-md-6 col-lg-4">
            <div class="card song-card ${isSelected ? 'selected' : ''}" id="card-${c.id}">
                <div class="select-checkbox" onclick="toggleSelection(${c.id}, event)">
                    <i class="fas fa-check"></i>
                </div>
                <div class="card-img-top">
                    <i class="fas fa-compact-disc"></i>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="song-title">${c.cancion}</h5>
                        <i class="fas fa-star favorite-star ${c.favorita ? 'active' : ''}" onclick="toggleFavorite(${c.id}, event)"></i>
                    </div>
                    <p class="song-artist">${c.artista}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="badge-genre">${c.genero}</span>
                        <div class="actions">
                            <button class="btn btn-sm text-primary me-2" onclick='editSong(${JSON.stringify(c).replace(/'/g, "&apos;")}, event)' title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
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

window.editSong = function(cancion, event) {
    if (event) event.stopPropagation();
    document.getElementById('songId').value = cancion.id;
    document.getElementById('songName').value = cancion.cancion;
    document.getElementById('songArtist').value = cancion.artista;
    document.getElementById('songGenre').value = cancion.genero;
    document.getElementById('songFavorite').checked = cancion.favorita;
    
    modalTitle.textContent = 'Editar Canción';
    songModal.show();
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
    alert(message); // Podría mejorarse con un toast real de Bootstrap
}
