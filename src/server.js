import 'dotenv/config';

import http from 'http';
import morgan from 'morgan';
import express from 'express';

import './database/connection.js';

import { auth } from './middlewares/auth.middleware.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import taskRouter from './routes/task.routes.js';

function main() {
    // Se asigna el puerto desde nuestro .env
    const port = +process.env.APP_PORT ?? 4000;
    const app = express();

    // Morgan para revisar peticiones en consola
    app.use(morgan('dev'));
    // Para conversion de datos a JSON para lectura en JS
    app.use(express.json());

    // Mensaje para ver si el Backend esta ejecutandose
    app.get('/', (req, res) => {
        res.send('Hola mundo!. Bienvenido a la pagina del backend!')
    });
    
    // Ruta de gestion de cuentas de usuario
    app.use('/auth', authRouter);
    // Ruta de gestion de perfil de usuario
    app.use('/users', auth, userRouter);
    // Ruta para gestion de tareas
    app.use('/tasks', auth, taskRouter);
    // Ejecucion del servidor en HTTP
    const httpServer = http.createServer(app);
    httpServer.listen(port, () => {
        console.log('Servidor ejecutado en el puerto: ', port);
        
    })
};

main();