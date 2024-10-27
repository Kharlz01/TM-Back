import { Router } from "express";

import {
    createLogin,
    createSignup
} from '../controllers/auth.controller.js';

const router = Router();

// Ruta de inicio de sesion
router.post('/login', createLogin);

// Ruta de registro de usuario
router.post('/signup', createSignup);

// TODO: Recuperacion de clave

export default router;