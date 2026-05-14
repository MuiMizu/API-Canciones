const { Cancion } = require('../models/cancion.model');

const getAll = async (req, res, next) => {
    try {
        const { favoritas, search } = req.query;
        const { Op } = require('sequelize');
        let where = {};
        
        if (favoritas === 'true' || favoritas === 'on') {
            where.favorita = true;
        }
        if (search) {
            where[Op.or] = [
                { cancion: { [Op.like]: `%${search}%` } },
                { artista: { [Op.like]: `%${search}%` } }
            ];
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

const bulkDelete = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Se requiere un array de IDs' });
        }
        await Cancion.destroy({ where: { id: ids } });
        res.status(200).json({ message: `${ids.length} canciones eliminadas` });
    } catch (error) {
        next(error);
    }
};

const bulkFavorite = async (req, res, next) => {
    try {
        const { ids, favorita } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Se requiere un array de IDs' });
        }
        await Cancion.update({ favorita: favorita }, { where: { id: ids } });
        res.status(200).json({ message: `${ids.length} canciones actualizadas` });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getAll, 
    getById, 
    toggleFavorita, 
    remove,
    bulkDelete,
    bulkFavorite
};
