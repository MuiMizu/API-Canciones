const express = require('express');
const router = express.Router();
const cancionController = require('../controllers/cancion.controller');

router.get('/', cancionController.getAll);
router.get('/:id', cancionController.getById);

// Rutas masivas y de estado
router.patch('/:id/favorita', cancionController.toggleFavorita);
router.delete('/:id', cancionController.remove);
router.post('/bulk-delete', cancionController.bulkDelete);
router.post('/bulk-favorite', cancionController.bulkFavorite);

module.exports = router;
