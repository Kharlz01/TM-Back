import { Router } from "express";

import { getCurrentUserInfo, 
    getUserById, 
    updateUser,
    changePassword,
} from "../controllers/user.controller.js";

const router = Router();

// Informacion de usuario loggeado
router.get('/userinfo', getCurrentUserInfo);

// Informacion de usuario desde el ID
router.get('/:id', getUserById);

// Actualizacion de datos del usuario.
router.put('/settings/:id', updateUser);

// Cambio de contraseña usuario loggeado
router.put('/changePassword', changePassword);

// TODO: Foto de perfil

export default router;