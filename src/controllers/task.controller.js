import { v4 } from "uuid";
import { Op, } from 'sequelize';
import { Task, } from '../database/models/index.js';

export async function createTask(req, res) {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "No se puede identificar el usuario."
        })
    }

    const { name, description, endDate, priority, status, tag } = req.body;

    try {

        // Verificar que otra tarea no tenga exactamente el mismo nombre

        const taskByName = await Task.findOne({
            where: {
                name,
                userId,
            }
        });

        if (taskByName) {
            return res
            .status(400)
            .json({
                success: false,
                message: "Ya tienes una tarea con ese nombre asignado."
            });
        }

        // Se verifica que la fecha de vencimiento no haya pasado ya.

        const nowDate = new Date();
        const currentEndDate = new Date(endDate);

        // Determinar si la fecha de vencimiento ya ocurrio
        if (currentEndDate <= nowDate) {
            return res.status(400).json({
                success: false,
                message: "La fecha de vencimiento debe ser futura a hoy.",
            });
        }



        const newTask = await Task.create({
            id: v4(),
            name,
            description,
            endDate,
            priority,
            status,
            tag,
            userId: userId,
        });

        return res.status(201).json({
            success: true,
            message: "Tarea creada.",
            data: newTask
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: `Algo salio mal. Error: ${err}`,
        });
    }
    
}

export async function getAllTasks(req, res) {
    const userId = req.userId;
  
    try {

      // Busca todas las tareas asociadas al usuario.
      const taskByUser = await Task.findAll({
        where: {
            userId,
        }
      });

      // Revisa si el objeto contiene informacion
      // En este caso, verifica si existen tareas asociadas
      if (Object.keys(taskByUser).length === 0) {
        return res.status(404).json({
          success: false,
          message: "El usuario no tiene tareas vigentes.",
        });
      }

      // Si existen tareas asociadas, retorna todas las que encontro
      return res.status(200).json({
        success: true,
        data: taskByUser,
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: `Algo salió mal. Error: ${err.message}`,
      });
    }
  }

export async function updateTask(req, res) {
    // Toma el id de los parametros
    const {
      id,
    } = req.params;

    try {
      // Busca la tarea por el Id proporcionado.
      const taskById = await Task.findOne({
        where: { 
          id, 
        },
      });

      // Verifica que la tarea exista por su Id
      if (!taskById) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'La tarea a actualizar no existe.',
          });
      }

      // Actualiza los valores de la tarea
      const updatedTask = {
        ...taskById,
        ...req.body,
      };

      // Actualiza los datos de la tarea en la base de datos
      await Task.update({
        ...updatedTask,
      }, {
        where: {
          id,
        },
      });

      // Retorna un mensaje con los datos de la tarea actualizada
      return res
        .status(201)
        .json({
          success: true,
          message: `Se ha actualizado la tarea: "${taskById.name}".`,
          data: {
            ...updatedTask,
          },
        });

    } catch (err) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Algo salio mal. Error: ${err.message}`,
        });
    }
}

export async function deleteTask(req, res) {
    // Recibe el Id de los parametros
    const {
      id,
    } = req.params;
  
    try {
      // Busca si el Id corresponde a una tarea
      const TaskById = await Task.findOne({
        where: { 
          id, 
        },
      });

      // Mensaje en caso de que la tarea buscada no exista
      if (!TaskById) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'La tarea a eliminar no existe.',
          });
      }

      // En el manejo de base de datos existen dos formas de borrado
      // Borrado fisico y Borrado logico
      // Un borrado fisico elimina todo rastro de datos la fila asociada al id
      // En este caso elimina la tarea de forma permanente
      // El borrado logico no elimina la tarea como tal, sino que la "deshabilita"
      // Para este caso se asigna una variable de actividad
      // Y en las consultas se especifica que si esta condicion es falsa
      // No tenga en cuenta estos datos asociados a las tareas deshabilitadas
      // Esta ultima opcion es recomendada ya que los datos pueden recuperarse
      // en caso de se eliminen algunos datos por accidente.

  
      // Opcion uno: Borrado fisico
      // Basicamente corresponde en base de datos a lo siguiente:
      // DELETE FROM Hotels WHERE id = $id;

      await Task.destroy({
        where: {
          id,
        },
      });
  
      // Opcion dos: Borrado logico
      
      // await Task.update({
      //   isActive: false,
      // }, {
      //   where: {
      //     id,
      //   },
      // });

      // Recuerda en las consultas tener en cuenta la condicion "isActive"
      // al momento de mostrar la informacion.
  
      return res
        .status(200)
        .json({
          success: true,
          message: `Se ha eliminado la tarea: ${TaskById.name}`,
        });
    } catch (err) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Algo salio mal. Error: ${err.message}`,
        });
    }
  }

  export async function searchTag(req, res) {

    const userId = req.userId;

    // Verificacion del usuario
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "No se puede identificar el usuario."
        })
    }

    // Lee el dato seleccionado
    const {
      value,
      status,
    } = req.query;

    // Se prepara la busqueda
    // .trim() elimina espacios innecesarios
    // .toLowerCase() vuelve todo minusculas
  
    const searchValue = value ? value.toLowerCase().trim() : "";
    const sortStatus = status ? status.split('-') : [];

    // La condicion dice que si no hay valor de busqueda
    // Que el valor sea vacio ("")
  
    try {

      // Busca en las tareas del usuario la asociada con el tag filtrado
      // Ademas de ordenarlas segun el estado

      const taskBySearch = await Task.findAll({
        where: {
            userId: userId,
            tag: {
                [Op.like]: `%${searchValue}%`
            },
        },
        // order: [['name', 'desc']]
        order: sortStatus.length ? [sortStatus] : []
      });
    
      
      // Mensaje en caso de que no hayan tareas con ese tag

      if (Object.keys(taskBySearch).length === 0) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'No hay tareas asociadas al filtro de busqueda.',
          });
      }
  
      return res
        .status(200)
        .json({
          success: true,
          length: (taskBySearch?.length ?? 0),
          data: taskBySearch,
        });

    } catch (err) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Algo salio mal. Error: ${err.message}`,
        });
    }
  }

  export async function getTaskById(req, res) {
    const {id} = req.params;
    // Identifica si hay un Id de busqueda
    if (!id) return res
        .status(400)
        .json({
            success: false,
            message: 'Falta el id de la tarea.'
        });
    
    // Try-catch en caso de problemas con la Base de datos.
    try{
        // Busca la tarea en la DB por Id
        const task = await Task.findOne({
            where: {
                id,
            }
        });

        // Identifica si la tarea existe

        if(!task) return res
            .status(404)
            .json({
                success: false,
                message: 'La tarea buscada no existe.'
            })

        // Devolvemos la tarea
        return res
            .status(200)
            .json({
                success: true,
                data: task,
            })

    } catch (err){
        return res
        .status(500)
        .json({
            success: false,
            message: `Lo sentimos, hubo un error. Detalles de error: ${err}`
        });
    }
}