require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
);

const Cancion = sequelize.define('Cancion', {
    cancion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "El nombre de la canción no puede estar vacío" }
        }
    },
    artista: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "El nombre del artista no puede estar vacío" }
        }
    },
    genero: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['pop', 'rock', 'reggaeton', 'hip hop', 'electronica', 'jazz', 'clasica', 'otro']],
                msg: "Género no permitido. Debe ser pop, rock, reggaeton, hip hop, electronica, jazz, clasica u otro."
            }
        }
    },
    favorita: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = { sequelize, Cancion };
