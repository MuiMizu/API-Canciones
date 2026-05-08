const { Cancion } = require('../models/cancion.model');

const getAll = async (req, res, next) => {
    try {
        const { genero, favoritas } = req.query;
        let where = {};
        
        if (genero) {
            where.genero = genero.toLowerCase();
        }
        if (favoritas === 'true' || favoritas === 'on') {
            where.favorita = true;
        }

        const canciones = await Cancion.findAll({ 
            where,
            order: [
                ['favorita', 'DESC'], 
                ['creado_en', 'DESC']
            ]
        });
        
        res.status(200).json(canciones);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const cancion = await Cancion.findByPk(req.params.id);
        if (!cancion) {
            return res.status(404).json({ error: 'Canción no encontrada' });
        }
        res.status(200).json(cancion);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const { cancion, artista, genero, favorita } = req.body;
        
        const newCancion = await Cancion.create({
            cancion,
            artista,
            genero: genero.toLowerCase(),
            favorita: favorita === 'true' || favorita === true || favorita === 'on'
        });
        
        res.status(201).json(newCancion);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const cancionModel = await Cancion.findByPk(req.params.id);
        if (!cancionModel) {
            return res.status(404).json({ error: 'Canción no encontrada' });
        }

        const { cancion, artista, genero, favorita } = req.body;
        
        await cancionModel.update({
            cancion,
            artista,
            genero: genero.toLowerCase(),
            favorita: favorita === 'true' || favorita === true || favorita === 'on'
        });
        
        res.status(200).json(cancionModel);
    } catch (error) {
        next(error);
    }
};

const toggleFavorita = async (req, res, next) => {
    try {
        const cancion = await Cancion.findByPk(req.params.id);
        if (!cancion) {
            return res.status(404).json({ error: 'Canción no encontrada' });
        }

        await cancion.update({ favorita: !cancion.favorita });
        res.status(200).json(cancion);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const cancion = await Cancion.findByPk(req.params.id);
        if (!cancion) {
            return res.status(404).json({ error: 'Canción no encontrada' });
        }

        await cancion.destroy();
        res.status(200).json({ message: 'Canción eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getAll, 
    getById, 
    create, 
    update, 
    toggleFavorita, 
    remove 
};
