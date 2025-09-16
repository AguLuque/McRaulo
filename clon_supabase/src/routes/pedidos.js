import { Router } from 'express';

const pedidosRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los pedidos
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM pedidos');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener pedidos');
        }
    });

    // GET pedido por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM pedidos WHERE id_pedido = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Pedido no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener pedido por ID');
        }
    });

    // POST nuevo pedido
    router.post('/', async (req, res) => {
        const { id_estado_pedido, total, id_tipo_pago, id_cliente, subtotal, descuento_total, id_cupon_aplicado, activo, fecha_eliminacion } = req.body;
        if (!id_estado_pedido || typeof total === 'undefined' || !id_tipo_pago || !id_cliente || typeof subtotal === 'undefined' || typeof descuento_total === 'undefined') {
            return res.status(400).json({ message: 'Faltan campos obligatorios: id_estado_pedido, total, id_tipo_pago, id_cliente, subtotal, descuento_total.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO pedidos (id_estado_pedido, total, id_tipo_pago, id_cliente, subtotal, descuento_total, id_cupon_aplicado, activo, fecha_eliminacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [id_estado_pedido, total, id_tipo_pago, id_cliente, subtotal, descuento_total, id_cupon_aplicado, activo, fecha_eliminacion]
            );
            res.status(201).json({ message: 'Pedido creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23503') {
                return res.status(400).json({ message: 'Error de clave foránea: estado, tipo de pago, cliente o cupón no existen.', error: error.message });
            }
            handleError(res, error, 'Error al crear pedido');
        }
    });

    // PUT actualizar pedido
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { id_estado_pedido, total, id_tipo_pago, id_cliente, subtotal, descuento_total, id_cupon_aplicado, activo, fecha_eliminacion } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE pedidos SET id_estado_pedido = $1, total = $2, id_tipo_pago = $3, id_cliente = $4, subtotal = $5, descuento_total = $6, id_cupon_aplicado = $7, activo = $8, fecha_eliminacion = $9 WHERE id_pedido = $10 RETURNING *',
                [id_estado_pedido, total, id_tipo_pago, id_cliente, subtotal, descuento_total, id_cupon_aplicado, activo, fecha_eliminacion, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Pedido no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Pedido actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23503') {
                return res.status(400).json({ message: 'Error de clave foránea: estado, tipo de pago, cliente o cupón no existen.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar pedido');
        }
    });

    // DELETE pedido (Implementado con Soft Delete)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('UPDATE pedidos SET activo = FALSE, fecha_eliminacion = NOW() WHERE id_pedido = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Pedido no encontrado o ya eliminado' });
            }
            res.status(200).json({ message: 'Pedido marcado como eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al marcar pedido como eliminado');
        }
    });

    // --- Nuevo Endpoint: Obtener Precio Total de un Pedido ---
    router.get('/:id/precioTotal', async (req, res) => {
        const { id } = req.params; // id es el idPedido
        try {
            const result = await db.oneOrNone(`
                SELECT SUM(pp.cantidad * pp.subtotal) as precioTotal
                FROM pedidos_productos pp
                WHERE pp.id_pedido = $1
            `, [id]);

            if (!result || result.preciototal === null) {
                return res.status(404).json({ message: 'Pedido no encontrado o sin productos para calcular el total.' });
            }
            res.status(200).json({ id_pedido: id, precioTotal: parseFloat(result.preciototal) });
        } catch (error) {
            handleError(res, error, 'Error al obtener el precio total del pedido');
        }
    });

    return router;
};

export default pedidosRoutes;