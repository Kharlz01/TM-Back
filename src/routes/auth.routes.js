import { Router } from "express";

import {
    createLogin,
    createSignup,
    resetPassword,
    sendEmail,
} from '../controllers/auth.controller.js';

import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

// Ruta de inicio de sesion
router.post('/login', createLogin);

// Ruta de registro de usuario
router.post('/signup', createSignup);

// Recuperacion de clave - email
router.post('/email', sendEmail);

// Reestablecimiento de clave
router.put('/resetPassword', auth, resetPassword)

export default router;