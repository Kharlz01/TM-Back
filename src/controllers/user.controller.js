import { User,} from '../database/models/index.js';
import { hashPassword, verifyPassword } from '../services/auth.service.js';

export async function getCurrentUserInfo(req, res) {
    const userId = req.userId;
    // Confirma el Id de la sesion actual
    if (!userId) return res
        .status(401)
        .json({
            success: false,
            message: "No se puede obtener el ID del usuario."
        });

    // Entrada al try-catch en caso de que la DB tenga problemas
    try{
        // Tomamos los datos del usuario desde el modelo
        const user = await User.findOne({
            attributes: ["id","email","givenName","lastName",
                "image", "createdAt","updatedAt"
            ],
            // Le decimos que tome los datos asociados al ID que tenemos
            where:{
                id: userId,
            }
        });

        // Condicion en caso de que no se identifique el usuario 
        if (!user) return res
            .status(404)
            .json({
                success: false,
                message: "No se pudo encontrar el usuario."
            });

        // Retorna todos los datos de usuario
        return res
            .status(200)
            .json({
                success: true,
                data: user.dataValues,
            })
    }catch(err){
        return res
            .status(400)
            .json({
                success: false,
                message: `Algo salio mal en la obtencion de datos. Error: ${err}`
            })
    }
}

export async function getUserById(req, res) {
    const {id} = req.params;
    // Identifica el id enlazado
    if (!id) return res
        .status(400)
        .json({
            success: false,
            message: 'Falta el id del usuario.'
        });
    
    // Try-catch en caso de problemas con la Base de datos.
    try{
        // Busca al usuario en la DB por Id
        const user = await User.findOne({
            where: {
                id,
            }
        });

        // Identifica si usuario existe

        if(!user) return res
            .status(404)
            .json({
                success: false,
                message: 'Usuario no existe.'
            })

        // Por seguridad eliminamos la contraseña

        const userResponse = {
            ...user.dataValues,
        }

        delete userResponse.password;

        // Devolvemos todos los valores

        return res
            .status(200)
            .json({
                success: true,
                data: userResponse,
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

export async function updateUser(req, res) {
  const { id } = req.params;

  try {
    const userById = await User.findOne({
      where: { id },
    });

    if (!userById) {
      return res.status(404).json({
        success: false,
        message: 'El usuario a actualizar no existe',
      });
    }

    // Crear un objeto con los datos actualizados
    const updatedUserData = {
      ...userById.dataValues, // Obtiene datos actuales del usuario
      ...req.body,
    };

    // Actualiza el usuario en la base de datos
    await User.update(updatedUserData, {
      where: { id },
    });

    // Obtener el usuario actualizado para asegurar que los datos son correctos
    const updatedUser = await User.findOne({
      where: { id },
    });

    return res.status(201).json({
      success: true,
      message: `Se ha actualizado el usuario con email ${updatedUser.email}`,
      data: {
        ...updatedUser.dataValues,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Algo salio mal. Error: ${err.message}`,
    });
  }


}

export async function changePassword(req, res) {
    // Se obtienen las contraseñas ingresadas en el aplicativo
  const {
    currentPassword,
    newPassword
  } = req.body;

  const userId = req.userId;

  try {
    // Buscamos el usuario por el ID
    const user = await User.findOne ({
      where: {
        id: userId
      }
    });

    // Llamamos a la funcion de verificacion de contraseña
    const verifiedPassword = await verifyPassword(currentPassword,user.password);

    // Se verifica si las contraseñas ingresadas coinciden
    if (!verifiedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Las credenciales no coinciden.'
      })
    }

    // Ya verificado, se hace el hash de la contraseña
    // para almacenarla en la base de datos.
    const newHashPassword = await hashPassword(newPassword);

    // Actualizamos contraseña
    await user.update({
      password: newHashPassword
    });

    await user.save()

    // Confirmamos al usuario que la contraseña fue cambiada.
    return res.status(201).json({
      success: true,
      message: 'La contraseña fue cambiada.'
    })

  } catch(error) {
    return res.status(500).json({
      success: false,
      message: "Algo salio mal."
    });
  }
  
}