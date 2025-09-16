import { Router } from 'express';

const productosIngredientesBaseRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los productos_ingredientes_base
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM productos_ingredientes_base');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener productos_ingredientes_base');
        }
    });

    // GET productos_ingredientes_base por PK (id_producto, id_ingrediente)
    router.get('/:id_producto/:id_ingrediente', async (req, res) => {
        const { id_producto, id_ingrediente } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM productos_ingredientes_base WHERE id_producto = $1 AND id_ingrediente = $2', [id_producto, id_ingrediente]);
            if (!result) {
                return res.status(404).json({ message: 'Producto_ingrediente_base no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener producto_ingrediente_base por PK');
        }
    });

    // POST nuevo productos_ingredientes_base
    router.post('/', async (req, res) => {
        const { id_producto, id_ingrediente, cantidad } = req.body;
        if (!id_producto || !id_ingrediente || typeof cantidad === 'undefined') {
            return res.status(400).json({ message: 'Faltan campos obligatorios: id_producto, id_ingrediente, cantidad.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO productos_ingredientes_base (id_producto, id_ingrediente, cantidad) VALUES ($1, $2, $3) RETURNING *',
                [id_producto, id_ingrediente, cantidad]
            );
            res.status(201).json({ message: 'Producto_ingrediente_base creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'La combinación de producto e ingrediente ya existe.', error: error.message });
            }
            if (error.code === '23503') {
                return res.status(400).json({ message: 'Error de clave foránea: producto o ingrediente no existen.', error: error.message });
            }
            handleError(res, error, 'Error al crear producto_ingrediente_base');
        }
    });

    // PUT actualizar productos_ingredientes_base
    router.put('/:id_producto/:id_ingrediente', async (req, res) => {
        const { id_producto, id_ingrediente } = req.params;
        const { cantidad } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE productos_ingredientes_base SET cantidad = $1 WHERE id_producto = $2 AND id_ingrediente = $3 RETURNING *',
                [cantidad, id_producto, id_ingrediente]
            );
            if (!result) {
                return res.status(404).json({ message: 'Producto_ingrediente_base no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Producto_ingrediente_base actualizado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al actualizar producto_ingrediente_base');
        }
    });

    // DELETE productos_ingredientes_base
    router.delete('/:id_producto/:id_ingrediente', async (req, res) => {
        const { id_producto, id_ingrediente } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM productos_ingredientes_base WHERE id_producto = $1 AND id_ingrediente = $2 RETURNING *', [id_producto, id_ingrediente]);
            if (!result) {
                return res.status(404).json({ message: 'Producto_ingrediente_base no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Producto_ingrediente_base eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar producto_ingrediente_base');
        }
    });

    return router;
};

export default productosIngredientesBaseRoutes;