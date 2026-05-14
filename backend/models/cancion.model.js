require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

console.log(`📡 Intentando conectar a MySQL en: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`👤 Usuario: ${process.env.DB_USER}`);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: console.log,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            }
        }
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
    favorita: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    imagen_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    audio_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = { sequelize, Cancion };
