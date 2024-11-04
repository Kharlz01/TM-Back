import { v4 } from 'uuid';
import { sendMail } from '../services/email.service.js';

import { 
    hashPassword, 
    verifyPassword,
    jwtEncode,
} from "../services/auth.service.js";

import { User,} from "../database/models/index.js";

export async function createLogin(req, res) {

    // Paso 1. Obtener los datos
    const {
        email,
        password,
    } = req.body;

    // Paso 2. Verificar los datos
    if (!email || !password) return res
        .status(401)
        .json({
            success: false,
            message: "Faltan datos por ingresar."
        });

    // Paso 3. Verificar que el correo exista
    const user = await User.findOne({
        where: {
            email,
        },
    });

    if (!user) return res
        .status(401)
        .json({
            success: false,
            message: "El usuario no existe."
        });

    // Paso 4. Verificar la contraseña
    const verifiedPassword = await verifyPassword(password,user.password);
    if (!verifiedPassword) return res
        .status(401)
        .json({
            success: false,
            message: "Credenciales incorrectas."
        });

    // Paso 5. Generar una token
    const now = new Date();

    const TWO_HS_IN = 60 * 60 * 2; // Dos horas de caducidad
    const expiresIn = Math.floor(now.getTime() / 1000) + TWO_HS_IN;

    // JSON solicitan claims para el registro
    // Claims = sub, exp, iat, iss
    const payload = {
        sub: user.id, // Sub es usuario
        exp: expiresIn, // Exp es el tiempo de expiracion.
        iat: now.getTime(), // iat es el tiempo de obtencion del token.
        iss: process.env.JWT_ISSUER, // iss es quien emitio el token (servidor).
    }

    // Se codifica el token
    const token = jwtEncode(payload);

    // Se elabora la respuesta
    return res
        .status(200)
        .json({
            success: true,
            data: {
                token,
                expiresIn: TWO_HS_IN,
            }
        });
}

export async function createSignup(req, res) {
    // Se reciben los datos
    const {
        email,
        password,
        givenName,
        lastName,
    } = req.body;

     // Se validan datos
     if (!email || !password || !givenName || !lastName) {
        return res
        .status(401)
        .json({
            success: false,
            message: 'Faltan campos requeridos.',
        });
    }
    
    // Verificar que la clave sea mayor a 8 caracteres
    if (password.lenght < 8){
        return res
        .status(400)
        .json({
            success: false,
            message: 'La contraseña debe tener minimo 8 caracteres.'
        });
    }

    // Verificar que email sea valido (Que tenga @ y el .)
    if (!email.includes('@') || !email.includes('.')) {
        return res
        .status(400)
        .json({
            success: false,
            message: 'El email ingresado no es valido.'
        })
    };

    // Buscar correo en la base de datos
    const user = await User.findOne({
        where: {
            email,
        },
    });

    // Verificar que el usuario que se registra, 
    // no tenga una cuenta con ese email
    if (user) {
        return res
            .status(400)
            .json({
                success: false,
                message: 'El usuario ya existe.'
            });
    }

    // Encriptar la clave.
    const passwordHash = await hashPassword(password); 

    // Al validarse se empieza a crear la cuenta
    const created = await User.create({
        id: v4(), // V4 nos ayuda a generar un id para el database
        email,
        password: passwordHash,
        givenName,
        lastName,
    });

    // En caso de que el usuario no se pueda crear.
    if (!created) return res
        .status(400)
        .json({
            success: false,
            message: 'El usuario no se pudo crear.'
        })

    // Creacion satisfactoria.
    res
        .status(201)
        .json({
            success: true,
            message: 'El usuario fue creado.'
        })
}

export async function sendEmail(req, res) {

    // Se recibe el correo del solicitante
    const { email } = req.body;

    const user = await User.findOne({ 
        where: { 
            email,
        } 
    });

    // Se verifica que la cuenta exista
    if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'El correo proporcionado no tiene una cuenta creada en nuestro sistema.',
          });
    }

    // Se generar una token temporal
    const now = new Date();

    const TEN_HS_IN = 60 * 20; // Diez minutos de caducidad
    const expiresIn = Math.floor(now.getTime() / 1000) + TEN_HS_IN;

    // JSON solicitan claims para el registro
    // Claims = sub, exp, iat, iss
    const payload = {
        sub: user.id, // Sub es usuario
        exp: expiresIn, // Exp es el tiempo de expiracion.
        iat: now.getTime(), // iat es el tiempo de obtencion del token.
        iss: process.env.JWT_ISSUER, // iss es quien emitio el token (servidor).
    }

    // Se codifica el token
    const token = jwtEncode(payload);

    const url = process.env.URL_FRONT;

    const resetLink = `${url}/reset-password?token=${token}`

    const body = ` <!DOCTYPE html> 
        <html lang="es"> 
        <head> 
            <meta charset="UTF-8"> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
            <title>Recuperación de Contraseña</title> 
            <style> 
            .container { 
                width: 100%; 
                padding: 20px; 
                background-color: #f2f2f2; 
                font-family: Arial, sans-serif;
            } 
            
            .content { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                padding: 20px; 
                border-radius: 8px; 
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
            } 
                
            .button { 
                background-color: #4CAF50; 
                color: white; 
                padding: 10px 20px; 
                text-align: center; 
                text-decoration: none; 
                display: inline-block; 
                border-radius: 5px; 
            } 
                
            .button:hover { 
            background-color: #45a049; 
            } 
            </style> 
        </head> 
        
        <body> 
            <div class="container"> 
                <div class="content"> 
                    <h2>Recuperación de Contraseña</h2> 
                    <p>Hola ${user.givenName},</p> 
                    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para restablecer tu contraseña:</p> 
                        <a href="${resetLink}" class="button">
                            Restablecer Contraseña
                        </a> 
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p> 
                    <p>Gracias,
                        <br>El equipo de TaskMaster
                    </p> 
                </div> 
            </div> 
        </body> 
        </html> `;
  
    try {
      await sendMail({ 
        to: email,
        subject: "Recuperacion de contraseña - Taskmaster", 
        body: body});
  
      return res
        .status(200)
        .json({
          success: true,
          message: 'El correo se ha enviado'
        });
    } catch (err) {
      return res
        .status(500)
        .json({
          success: false,
          message: `Error: ${err.message}`,
        });
    }
  }

export async function resetPassword(req, res) {
    // Se obtienen las contraseñas ingresadas en el aplicativo
  const { newPassword } = req.body;

  const userId = req.userId;
  
  try {
    // Buscamos el usuario por el ID
    const user = await User.findOne ({
      where: {
        id: userId
      }
    });

    if (!user) { 
        return res
        .status(404)
        .json({ 
            success: false, 
            message: 'Usuario no encontrado. Reinicie la pagina', 
        });
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
      message: `Error: ${error.message} y ${newPassword}`
    });
  }
  
  }
  