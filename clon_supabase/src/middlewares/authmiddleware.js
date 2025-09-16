import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    // 1. Obtener el token del header de la petición
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // El token viene como 'Bearer TOKEN'

    // 2. Si no hay token, denegar el acceso
    if (token == null) {
        return res.status(401).json({ message: 'Acceso denegado: Token no proporcionado.' });
    }

    // 3. Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            // Si el token es inválido o ha expirado, denegar el acceso
            return res.status(403).json({ message: 'Acceso denegado: Token inválido o expirado.' });
        }
        // 4. Si el token es válido, guardar la información del usuario en la petición
        req.user = user;
        next(); // Continuar con la siguiente función (la ruta original)
    });
};

export default verifyToken;