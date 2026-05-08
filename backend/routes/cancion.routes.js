const express = require('express');
const router = express.Router();
const cancionController = require('../controllers/cancion.controller');
const { validateCancion } = require('../middlewares/validators');

router.get('/', cancionController.getAll);

router.get('/:id', cancionController.getById);
router.post('/', validateCancion, cancionController.create);
router.put('/:id', validateCancion, cancionController.update);
router.patch('/:id/favorita', cancionController.toggleFavorita);
router.delete('/:id', cancionController.remove);

module.exports = router;
