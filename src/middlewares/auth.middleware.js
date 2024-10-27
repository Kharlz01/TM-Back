import { jwtVerify } from "../services/auth.service.js";

export async function auth(req, res, next){
    // Los tokens se almacenan generalmente en la cabecera
    // Por tanto obtenemos los datos de authorization de alli
    const authorization = req.headers.authorization;

    // Verificamos que el valor no este vacio.
    if (!authorization) return res
        .status(401)
        .json({
            success: false,
            message: 'No hay cabecera de autorizacion.'
        });

    // El valor en la autorizacion generalmente es el siguiente:
    // Authorization = "Bearer {token}"
    // Si lo dividimos siendo el espacio el punto de separacion obtenemos:
    // Result: ['Bearer', *token*]

    const fragments = authorization.split(' ');
    // Almacenamos por separado el token y el tipo de token (usualmente Bearer) 
    const [tokenType, token] = fragments;

    // Se verifica tipo de token
    if (tokenType !== 'Bearer') return res
        .status(401)
        .json({
            success: false,
            message: 'Tipo de token invalido.'
        });
    
    // Se verifica el token como tal
    if (!token) return res
        .status(403)
        .json({
            success: false,
            message: 'No hay token.'
        });

    // Se valida el token con nuestro JWT
    const verified = jwtVerify(token);
    if (!verified) return res
        .status(403)
        .json({
            success: false,
            message: "Token invalido."
        });

    // Finalmente asignamos el id del usuario a la request
    req.userId = verified.sub;

    // Si el token es valido, damos acceso al cliente
    next();
}