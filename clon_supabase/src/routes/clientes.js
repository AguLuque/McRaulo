/*import { Router } from 'express';

const clientesRoutes = (db, handleError) => {
    const router = Router();
    
    // ... tus endpoints CRUD de clientes van aquí ...
    

// GET todos los clientes
router.get('/', async (req, res) => {
    try {
        const result = await db.any('SELECT * FROM clientes');
        res.status(200).json(result);
    } catch (error) {
        handleError(res, error, 'Error al obtener clientes');
    }
});

// GET cliente por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.oneOrNone('SELECT * FROM clientes WHERE id_cliente = $1', [id]);
        if (!result) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json(result);
    } catch (error) {
        handleError(res, error, 'Error al obtener cliente por ID');
    }
});

// POST nuevo cliente
router.post('/', async (req, res) => {
    const { nombre, apellido, usuario, contrasena_hash, email, telefono, id_tipo_contribuyente } = req.body;
    if (!nombre || !apellido || !contrasena_hash || !email) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, apellido, contrasena_hash, email.' });
    }
    try {
        const result = await db.one(
            'INSERT INTO clientes (nombre, apellido, usuario, contrasena_hash, email, telefono, id_tipo_contribuyente) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, apellido, usuario, contrasena_hash, email, telefono, id_tipo_contribuyente]
        );
        res.status(201).json({ message: 'Cliente creado con éxito', data: result });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El usuario o email ya existen.', error: error.message });
        }
        if (error.code === '23503') {
            return res.status(400).json({ message: 'El tipo de contribuyente especificado no existe.', error: error.message });
        }
        handleError(res, error, 'Error al crear cliente');
    }
});

// PUT actualizar cliente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, usuario, contrasena_hash, email, telefono, id_tipo_contribuyente } = req.body;
    try {
        const result = await db.oneOrNone(
            'UPDATE clientes SET nombre = $1, apellido = $2, usuario = $3, contrasena_hash = $4, email = $5, telefono = $6, id_tipo_contribuyente = $7 WHERE id_cliente = $8 RETURNING *',
            [nombre, apellido, usuario, contrasena_hash, email, telefono, id_tipo_contribuyente, id]
        );
        if (!result) {
            return res.status(404).json({ message: 'Cliente no encontrado para actualizar' });
        }
        res.status(200).json({ message: 'Cliente actualizado con éxito', data: result });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El usuario o email ya existen.', error: error.message });
        }
        if (error.code === '23503') {
            return res.status(400).json({ message: 'El tipo de contribuyente especificado no existe.', error: error.message });
        }
        handleError(res, error, 'Error al actualizar cliente');
    }
});

// DELETE cliente
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.oneOrNone('DELETE FROM clientes WHERE id_cliente = $1 RETURNING *', [id]);
        if (!result) {
            return res.status(404).json({ message: 'Cliente no encontrado para eliminar' });
        }
        res.status(200).json({ message: 'Cliente eliminado con éxito', data: result });
    } catch (error) {
        handleError(res, error, 'Error al eliminar cliente');
    }
});

// --- Nuevo Endpoint: Obtener Puntos de un Cliente ---
router.get('/:id/puntos', async (req, res) => {
    const { id } = req.params; // id es el idCliente
    try {
        const result = await db.oneOrNone(`
            SELECT SUM(p.total * 0.1) as puntos
            FROM pedidos p
            WHERE p.id_cliente = $1
        `, [id]);

        if (!result || result.puntos === null) {
            return res.status(404).json({ message: 'Cliente no encontrado o sin pedidos para calcular puntos.' });
        }
        res.status(200).json({ id_cliente: id, puntos: parseFloat(result.puntos) });
    } catch (error) {
        handleError(res, error, 'Error al obtener los puntos del cliente');
    }
});

    return router;
};
export default clientesRoutes; */

import { Router } from 'express';

const clientesRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los clientes
    router.get('/', async (req, res) => {
        try {
            const result = await db.any(`
                SELECT 
                    c.id_cliente,
                    c.nombre,
                    c.apellido,
                    c.email,
                    c.telefono,
                    c.id_tipo_contribuyente,
                    c.fecha_registro,
                    tc.nombre as tipo_contribuyente_nombre
                FROM clientes c
                LEFT JOIN tipo_contribuyente tc ON c.id_tipo_contribuyente = tc.id_tipo_contribuyente
                ORDER BY c.id_cliente
            `);
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener clientes');
        }
    });

    // GET cliente por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone(`
                SELECT 
                    c.id_cliente,
                    c.nombre,
                    c.apellido,
                    c.email,
                    c.telefono,
                    c.id_tipo_contribuyente,
                    c.fecha_registro,
                    tc.nombre as tipo_contribuyente_nombre
                FROM clientes c
                LEFT JOIN tipo_contribuyente tc ON c.id_tipo_contribuyente = tc.id_tipo_contribuyente
                WHERE c.id_cliente = $1
            `, [id]);
            
            if (!result) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener cliente por ID');
        }
    });

    // POST nuevo cliente (CORREGIDO - solo campos que existen en la tabla)
    router.post('/', async (req, res) => {
        const { nombre, apellido, email, telefono, id_tipo_contribuyente } = req.body;
        
        // Validación de campos obligatorios según tu esquema real
        if (!nombre || !apellido || !email) {
            return res.status(400).json({ 
                message: 'Faltan campos obligatorios: nombre, apellido, email.' 
            });
        }
        
        try {
            const result = await db.one(
                'INSERT INTO clientes (nombre, apellido, email, telefono, id_tipo_contribuyente) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [nombre, apellido, email, telefono, id_tipo_contribuyente]
            );
            res.status(201).json({ 
                message: 'Cliente creado con éxito', 
                data: result 
            });
        } catch (error) {
            if (error.code === '23505') {
                // Email único duplicado
                return res.status(409).json({ 
                    message: 'El email ya existe.', 
                    error: error.message 
                });
            }
            if (error.code === '23503') {
                // Foreign key constraint (tipo_contribuyente)
                return res.status(400).json({ 
                    message: 'El tipo de contribuyente especificado no existe.', 
                    error: error.message 
                });
            }
            handleError(res, error, 'Error al crear cliente');
        }
    });

    // PUT actualizar cliente (CORREGIDO)
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre, apellido, email, telefono, id_tipo_contribuyente } = req.body;
        
        try {
            const result = await db.oneOrNone(
                'UPDATE clientes SET nombre = $1, apellido = $2, email = $3, telefono = $4, id_tipo_contribuyente = $5 WHERE id_cliente = $6 RETURNING *',
                [nombre, apellido, email, telefono, id_tipo_contribuyente, id]
            );
            
            if (!result) {
                return res.status(404).json({ message: 'Cliente no encontrado para actualizar' });
            }
            
            res.status(200).json({ 
                message: 'Cliente actualizado con éxito', 
                data: result 
            });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ 
                    message: 'El email ya existe.', 
                    error: error.message 
                });
            }
            if (error.code === '23503') {
                return res.status(400).json({ 
                    message: 'El tipo de contribuyente especificado no existe.', 
                    error: error.message 
                });
            }
            handleError(res, error, 'Error al actualizar cliente');
        }
    });

    // DELETE cliente
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            // Verificar si el cliente tiene pedidos asociados
            const tienePedidos = await db.oneOrNone(
                'SELECT COUNT(*) as count FROM pedidos WHERE id_cliente = $1', 
                [id]
            );
            
            if (tienePedidos && parseInt(tienePedidos.count) > 0) {
                return res.status(400).json({ 
                    message: 'No se puede eliminar el cliente porque tiene pedidos asociados' 
                });
            }
            
            const result = await db.oneOrNone(
                'DELETE FROM clientes WHERE id_cliente = $1 RETURNING *', 
                [id]
            );
            
            if (!result) {
                return res.status(404).json({ message: 'Cliente no encontrado para eliminar' });
            }
            
            res.status(200).json({ 
                message: 'Cliente eliminado con éxito', 
                data: result 
            });
        } catch (error) {
            handleError(res, error, 'Error al eliminar cliente');
        }
    });

    // --- Endpoint: Obtener Puntos de un Cliente ---
    router.get('/:id/puntos', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone(`
                SELECT 
                    c.id_cliente,
                    c.nombre,
                    c.apellido,
                    COALESCE(SUM(p.total * 0.1), 0) as puntos,
                    COUNT(p.id_pedido) as total_pedidos
                FROM clientes c
                LEFT JOIN pedidos p ON c.id_cliente = p.id_cliente 
                WHERE c.id_cliente = $1 AND (p.activo = true OR p.activo IS NULL)
                GROUP BY c.id_cliente, c.nombre, c.apellido
            `, [id]);

            if (!result) {
                return res.status(404).json({ message: 'Cliente no encontrado.' });
            }
            
            res.status(200).json({ 
                id_cliente: result.id_cliente,
                cliente: `${result.nombre} ${result.apellido}`,
                puntos: parseFloat(result.puntos),
                total_pedidos: parseInt(result.total_pedidos)
            });
        } catch (error) {
            handleError(res, error, 'Error al obtener los puntos del cliente');
        }
    });

    // --- NUEVO: Endpoint para obtener historial de pedidos del cliente ---
    router.get('/:id/pedidos', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.any(`
                SELECT 
                    p.id_pedido,
                    p.fecha_hora,
                    p.total,
                    p.subtotal,
                    p.descuento_total,
                    ep.nombre as estado,
                    tp.nombre as tipo_pago,
                    p.tipo_servicio
                FROM pedidos p
                LEFT JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
                LEFT JOIN tipo_pago tp ON p.id_tipo_pago = tp.id_tipo_pago
                WHERE p.id_cliente = $1 AND p.activo = true
                ORDER BY p.fecha_hora DESC
            `, [id]);
            
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener el historial de pedidos del cliente');
        }
    });

    return router;
};

export default clientesRoutes;