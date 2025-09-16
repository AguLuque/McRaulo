import { Router } from 'express';

const pedidosProductosIngredientesRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los pedidos_productos_ingredientes
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM pedidos_productos_ingredientes');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener pedidos_productos_ingredientes');
        }
    });

    // GET pedidos_productos_ingredientes por PK (id_pedido_producto, id_ingrediente)
    router.get('/:id_pedido_producto/:id_ingrediente', async (req, res) => {
        const { id_pedido_producto, id_ingrediente } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM pedidos_productos_ingredientes WHERE id_pedido_producto = $1 AND id_ingrediente = $2', [id_pedido_producto, id_ingrediente]);
            if (!result) {
                return res.status(404).json({ message: 'Pedido_producto_ingrediente no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener pedido_producto_ingrediente por PK');
        }
    });

    // POST nuevo pedidos_productos_ingredientes
    router.post('/', async (req, res) => {
        const { id_pedido_producto, id_ingrediente, cantidad, es_extra } = req.body;
        if (!id_pedido_producto || !id_ingrediente || typeof cantidad === 'undefined' || typeof es_extra === 'undefined') {
            return res.status(400).json({ message: 'Faltan campos obligatorios: id_pedido_producto, id_ingrediente, cantidad, es_extra.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO pedidos_productos_ingredientes (id_pedido_producto, id_ingrediente, cantidad, es_extra) VALUES ($1, $2, $3, $4) RETURNING *',
                [id_pedido_producto, id_ingrediente, cantidad, es_extra]
            );
            res.status(201).json({ message: 'Ingrediente de detalle de pedido creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') { // Si intentas insertar una PK duplicada
                return res.status(409).json({ message: 'La combinación de pedido_producto e ingrediente ya existe.', error: error.message });
            }
            if (error.code === '23503') {
                return res.status(400).json({ message: 'Error de clave foránea: pedido_producto o ingrediente no existen.', error: error.message });
            }
            handleError(res, error, 'Error al crear ingrediente de detalle de pedido');
        }
    });

    // PUT actualizar pedidos_productos_ingredientes
    router.put('/:id_pedido_producto/:id_ingrediente', async (req, res) => {
        const { id_pedido_producto, id_ingrediente } = req.params;
        const { cantidad, es_extra } = req.body; // No se actualizan las PK
        try {
            const result = await db.oneOrNone(
                'UPDATE pedidos_productos_ingredientes SET cantidad = $1, es_extra = $2 WHERE id_pedido_producto = $3 AND id_ingrediente = $4 RETURNING *',
                [cantidad, es_extra, id_pedido_producto, id_ingrediente]
            );
            if (!result) {
                return res.status(404).json({ message: 'Pedido_producto_ingrediente no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Pedido_producto_ingrediente actualizado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al actualizar pedido_producto_ingrediente');
        }
    });

    // DELETE pedidos_productos_ingredientes
    router.delete('/:id_pedido_producto/:id_ingrediente', async (req, res) => {
        const { id_pedido_producto, id_ingrediente } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM pedidos_productos_ingredientes WHERE id_pedido_producto = $1 AND id_ingrediente = $2 RETURNING *', [id_pedido_producto, id_ingrediente]);
            if (!result) {
                return res.status(404).json({ message: 'Pedido_producto_ingrediente no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Pedido_producto_ingrediente eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar pedido_producto_ingrediente');
        }
    });
    
    return router;
};

export default pedidosProductosIngredientesRoutes;