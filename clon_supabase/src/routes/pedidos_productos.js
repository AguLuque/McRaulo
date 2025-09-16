import { Router } from 'express';

const pedidosProductosRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los pedidos_productos
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM pedidos_productos');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener pedidos_productos');
        }
    });

    // GET pedidos_productos por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM pedidos_productos WHERE id_pedido_producto = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Pedido_producto no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener pedido_producto por ID');
        }
    });

    // POST nuevo pedidos_productos
    router.post('/', async (req, res) => {
        const { id_pedido, id_producto, subtotal, cantidad, notas } = req.body;
        if (!id_pedido || !id_producto || typeof subtotal === 'undefined' || typeof cantidad === 'undefined') {
            return res.status(400).json({ message: 'Faltan campos obligatorios: id_pedido, id_producto, subtotal, cantidad.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO pedidos_productos (id_pedido, id_producto, subtotal, cantidad, notas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [id_pedido, id_producto, subtotal, cantidad, notas]
            );
            res.status(201).json({ message: 'Detalle de pedido creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23503') {
                return res.status(400).json({ message: 'Error de clave foránea: pedido o producto no existen.', error: error.message });
            }
            handleError(res, error, 'Error al crear detalle de pedido');
        }
    });

    // PUT actualizar pedidos_productos
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { id_pedido, id_producto, subtotal, cantidad, notas } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE pedidos_productos SET id_pedido = $1, id_producto = $2, subtotal = $3, cantidad = $4, notas = $5 WHERE id_pedido_producto = $6 RETURNING *',
                [id_pedido, id_producto, subtotal, cantidad, notas, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Pedido_producto no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Pedido_producto actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23503') {
                return res.status(400).json({ message: 'Error de clave foránea: pedido o producto no existen.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar pedido_producto');
        }
    });

    // DELETE pedidos_productos
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM pedidos_productos WHERE id_pedido_producto = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Pedido_producto no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Pedido_producto eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar pedido_producto');
        }
    });

    return router;
};

export default pedidosProductosRoutes;