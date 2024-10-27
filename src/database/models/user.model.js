import { DataTypes } from "sequelize";

import { connection } from '../connection.js';

const User = connection.define(
    'users',
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey : true,
        },
        email: {
            type: DataTypes.STRING,
            unique : true,
        },
        password: DataTypes.STRING,
        givenName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        image: DataTypes.STRING,
    },
    {
        timestamps: true, //createdAt, updatedAt
    }
);



export { 
    User, 
};