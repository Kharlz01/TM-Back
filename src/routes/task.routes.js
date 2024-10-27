import { Router } from "express";

import { 
    createTask,
    deleteTask,
    getAllTasks,
    getTaskById,
    searchTag,
    updateTask, 
} from "../controllers/task.controller.js";

const router = Router();

// Ruta para creacion de tarea.
router.post('/newTask', createTask);

// Ruta para visualizacion de tareas (General)
router.get('/showTasks', getAllTasks);

// Ruta para actualizar tareas
router.put('/:id', updateTask);

// Ruta para eliminar tareas
router.delete('/:id', deleteTask);

// Filtrar las tareas
router.get('/tags', searchTag);

// Visualizar tarea individual
router.get('/:id', getTaskById);

export default router;