const validateCancion = (req, res, next) => {
    const { cancion, artista, genero } = req.body;
    
    if (!cancion || !artista || !genero) {
        return res.status(400).json({ error: 'Faltan datos requeridos (cancion, artista, genero son obligatorios)' });
    }
    
    const generosPermitidos = ['pop', 'rock', 'reggaeton', 'hip hop', 'electronica', 'jazz', 'clasica', 'otro'];
    if (!generosPermitidos.includes(genero.toLowerCase())) {
        return res.status(400).json({ error: 'Género no permitido. Opciones: ' + generosPermitidos.join(', ') });
    }

    next();
};

module.exports = { validateCancion };
