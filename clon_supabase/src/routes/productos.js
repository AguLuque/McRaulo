import { Router } from 'express';

const productosRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los productos
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM productos');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener productos');
        }
    });

// Nuevo GET para obtener solo las hamburguesas por sus IDs específicos
router.get('/hamburguesas', async (req, res) => {
    try {
        const result = await db.any('SELECT * FROM productos WHERE id_producto IN (11, 12, 13)');
        res.status(200).json(result);
    } catch (error) {
        handleError(res, error, 'Error al obtener hamburguesas');
    }
});

    // GET producto por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM productos WHERE id_producto = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener producto por ID');
        }
    });

    // POST nuevo producto
    router.post('/', async (req, res) => {
        const { nombre, descripcion, precio_base, categoria, disponible } = req.body;
        if (!nombre || typeof precio_base === 'undefined' || typeof disponible === 'undefined') {
            return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, precio_base, disponible.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO productos (nombre, descripcion, precio_base, categoria, disponible) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [nombre, descripcion, precio_base, categoria, disponible]
            );
            res.status(201).json({ message: 'Producto creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del producto ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear producto');
        }
    });

    // PUT actualizar producto
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre, descripcion, precio_base, categoria, disponible } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE productos SET nombre = $1, descripcion = $2, precio_base = $3, categoria = $4, disponible = $5 WHERE id_producto = $6 RETURNING *',
                [nombre, descripcion, precio_base, categoria, disponible, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Producto no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Producto actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del producto ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar producto');
        }
    });

    // DELETE producto
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM productos WHERE id_producto = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Producto no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Producto eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar producto');
        }
    });

    return router;
};

export default productosRoutes;