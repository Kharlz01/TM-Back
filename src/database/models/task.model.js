import { DataTypes } from "sequelize";

import { connection } from '../connection.js';

const Task = connection.define(
    'tasks',
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey : true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'), // BAJA, MEDIA O ALTA.
            allowNull: false,
            defaultValue: 'low',
        },
        status: {
            type: DataTypes.ENUM('pending', 'ongoing', 'completed'), // PENDIENTE, EN PROGRESO O COMPLETADA.
            allowNull: false,
            defaultValue: 'pending',
        },
        tag: {
            type: DataTypes.ENUM(
                'not','me', 'work', 'home', 'projects', 
                'relative', 'education', 'health', 
                'money', 'creative'), // CATEGORIAS DETERMINADAS
            allowNull: false,
            defaultValue: 'not',
        },
    },
    {
        timestamps: true, //createdAt, updatedAt
    }
);



export { 
    Task, 
};