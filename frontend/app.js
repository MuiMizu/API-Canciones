const API_URL = 'http://localhost:3000/api/canciones';
const songsContainer = document.getElementById('songsContainer');
const songModal = new bootstrap.Modal(document.getElementById('songModal'));
const songForm = document.getElementById('songForm');
const modalTitle = document.getElementById('modalTitle');

document.addEventListener('DOMContentLoaded', () => {
    fetchSongs();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('import') === 'success') {
        alert('¡Canciones de Spotify importadas correctamente!');
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error')) {
        alert('Error al importar desde Spotify: ' + urlParams.get('error'));
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

document.getElementById('filterGenero').addEventListener('change', fetchSongs);
document.getElementById('filterFavoritas').addEventListener('change', fetchSongs);

document.getElementById('btnNueva').addEventListener('click', () => {
    songForm.reset();
    document.getElementById('songId').value = '';
    modalTitle.textContent = 'Agregar Canción';
});

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
        if (id) {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        songModal.hide();
        fetchSongs();
    } catch (error) {
        console.error(error);
        alert('Error al guardar la canción');
    }
});

async function fetchSongs() {
    try {
        const genero = document.getElementById('filterGenero').value;
        const favoritas = document.getElementById('filterFavoritas').checked;
        
        let url = API_URL + '?';
        if (genero) url += `genero=${genero}&`;
        if (favoritas) url += `favoritas=on`;

        const res = await fetch(url);
        const canciones = await res.json();
        
        renderSongs(canciones);
    } catch (error) {
        console.error(error);
        songsContainer.innerHTML = '<div class="alert alert-danger w-100 text-center">Error al conectar con la API.</div>';
    }
}

function renderSongs(canciones) {
    if (canciones.length === 0) {
        songsContainer.innerHTML = '<div class="alert alert-info w-100 text-center">No hay canciones que coincidan con la búsqueda.</div>';
        return;
    }

    songsContainer.innerHTML = canciones.map(c => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card song-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0">${c.cancion}</h5>
                        <span class="favorite-btn ${c.favorita ? '' : 'inactive'}" onclick="toggleFavorite(${c.id})">★</span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted">${c.artista}</h6>
                    <span class="badge bg-secondary mb-3">${c.genero}</span>
                    
                    <div class="d-flex justify-content-between mt-auto">
                        <button class="btn btn-sm btn-outline-primary" onclick='editSong(${JSON.stringify(c).replace(/'/g, "&apos;")})'>Editar</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSong(${c.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function toggleFavorite(id) {
    try {
        await fetch(`${API_URL}/${id}/favorita`, { method: 'PATCH' });
        fetchSongs();
    } catch (error) {
        console.error(error);
    }
}

async function deleteSong(id) {
    if (!confirm('¿Estás seguro de eliminar esta canción?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchSongs();
    } catch (error) {
        console.error(error);
    }
}

window.editSong = function(cancion) {
    document.getElementById('songId').value = cancion.id;
    document.getElementById('songName').value = cancion.cancion;
    document.getElementById('songArtist').value = cancion.artista;
    document.getElementById('songGenre').value = cancion.genero;
    document.getElementById('songFavorite').checked = cancion.favorita;
    
    modalTitle.textContent = 'Editar Canción';
    songModal.show();
}
