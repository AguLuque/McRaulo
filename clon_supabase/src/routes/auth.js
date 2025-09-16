import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default (db, handleError) => {
    const router = Router();

    // Endpoint para el registro de nuevos clientes/usuarios
    router.post('/register', async (req, res) => {
        const { nombre, apellido, email, password, telefono, id_tipo_contribuyente } = req.body;

        if (!email || !password || !nombre || !apellido) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        try {
            const passwordHash = await bcrypt.hash(password, 10);

            const nuevoCliente = await db.oneOrNone(
                'INSERT INTO clientes(nombre, apellido, email, telefono, id_tipo_contribuyente) VALUES($1, $2, $3, $4, $5) RETURNING id_cliente',
                [nombre, apellido, email, telefono, id_tipo_contribuyente]
            );

            if (!nuevoCliente) {
                return res.status(500).json({ message: 'Error al crear el cliente' });
            }
            
            await db.none(
                'INSERT INTO usuarios(email, password_hash, id_cliente) VALUES($1, $2, $3)',
                [email, passwordHash, nuevoCliente.id_cliente]
            );

            res.status(201).json({ message: 'Usuario registrado exitosamente', id_cliente: nuevoCliente.id_cliente });
            
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El email ya está registrado' });
            }
            handleError(res, error, 'Error al registrar el usuario');
        }
    });

    // Endpoint para el inicio de sesión
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'El email y la contraseña son obligatorios' });
        }

        try {
            const usuario = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
            
            if (!usuario) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }
            
            const esValido = await bcrypt.compare(password, usuario.password_hash);

            if (!esValido) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }
            
            const token = jwt.sign(
                { id: usuario.id_usuario, id_cliente: usuario.id_cliente, email: usuario.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ token });

        } catch (error) {
            handleError(res, error, 'Error al iniciar sesión');
        }
    });

    return router;
};