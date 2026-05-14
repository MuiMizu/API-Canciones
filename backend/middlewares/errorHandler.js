const errorHandler = (err, req, res, next) => {
    console.error('Error en el servidor:', err);

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            error: 'Error de validación',
            detalles: err.errors.map(e => e.message)
        });
    }

    res.status(500).json({ 
        error: 'Ocurrió un error interno en el servidor',
        mensaje: err.message // Mostramos el error real para debuggear
    });
};

module.exports = errorHandler;
