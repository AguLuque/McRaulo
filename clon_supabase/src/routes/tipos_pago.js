import { Router } from 'express';

const tiposPagoRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los tipos de pago
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM tipo_pago');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener tipos de pago');
        }
    });

    // GET tipo de pago por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM tipo_pago WHERE id_tipo_pago = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Tipo de pago no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener tipo de pago por ID');
        }
    });

    // POST nuevo tipo de pago
    router.post('/', async (req, res) => {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'Falta campo obligatorio: nombre.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO tipo_pago (nombre) VALUES ($1) RETURNING *',
                [nombre]
            );
            res.status(201).json({ message: 'Tipo de pago creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del tipo de pago ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear tipo de pago');
        }
    });

    // PUT actualizar tipo de pago
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE tipo_pago SET nombre = $1 WHERE id_tipo_pago = $2 RETURNING *',
                [nombre, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Tipo de pago no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Tipo de pago actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del tipo de pago ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar tipo de pago');
        }
    });

    // DELETE tipo de pago
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM tipo_pago WHERE id_tipo_pago = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Tipo de pago no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Tipo de pago eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar tipo de pago');
        }
    });

    return router;
};

export default tiposPagoRoutes;