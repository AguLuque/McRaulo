import { Router } from 'express';

const estadosPedidoRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los estados de pedido
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM estado_pedido');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener estados de pedido');
        }
    });

    // GET estado de pedido por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM estado_pedido WHERE id_estado_pedido = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Estado de pedido no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener estado de pedido por ID');
        }
    });

    // POST nuevo estado de pedido
    router.post('/', async (req, res) => {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'Falta campo obligatorio: nombre.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO estado_pedido (nombre) VALUES ($1) RETURNING *',
                [nombre]
            );
            res.status(201).json({ message: 'Estado de pedido creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del estado de pedido ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear estado de pedido');
        }
    });

    // PUT actualizar estado de pedido
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE estado_pedido SET nombre = $1 WHERE id_estado_pedido = $2 RETURNING *',
                [nombre, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Estado de pedido no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Estado de pedido actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del tipo de pedido ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar estado de pedido');
        }
    });

    // DELETE estado de pedido
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM estado_pedido WHERE id_estado_pedido = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Estado de pedido no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Estado de pedido eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar estado de pedido');
        }
    });

    return router;
};

export default estadosPedidoRoutes;