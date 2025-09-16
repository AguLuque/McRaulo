import { Router } from 'express';

const cuponesRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los cupones
    router.get('/cupones', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM cupon');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener cupones');
        }
    });

    // GET cupon por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM cupon WHERE id_cupon = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Cupón no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener cupón por ID');
        }
    });

    // POST nuevo cupon
    router.post('/', async (req, res) => {
        const { id_cupon_predefinido, id_cliente, codigo_unico, fecha_vencimiento, usos_restantes, aplicado, fecha_aplicacion } = req.body;
        if (!id_cupon_predefinido) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: id_cupon_predefinido.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO cupon (id_cupon_predefinido, id_cliente, codigo_unico, fecha_vencimiento, usos_restantes, aplicado, fecha_aplicacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [id_cupon_predefinido, id_cliente, codigo_unico, fecha_vencimiento, usos_restantes, aplicado, fecha_aplicacion]
            );
            res.status(201).json({ message: 'Cupón creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El código único del cupón ya existe.', error: error.message });
            }
            if (error.code === '23503') {
                return res.status(400).json({ message: 'El cliente o cupón predefinido especificado no existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear cupón');
        }
    });

    // PUT actualizar cupon
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { id_cupon_predefinido, id_cliente, codigo_unico, fecha_vencimiento, usos_restantes, aplicado, fecha_aplicacion } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE cupon SET id_cupon_predefinido = $1, id_cliente = $2, codigo_unico = $3, fecha_vencimiento = $4, usos_restantes = $5, aplicado = $6, fecha_aplicacion = $7 WHERE id_cupon = $8 RETURNING *',
                [id_cupon_predefinido, id_cliente, codigo_unico, fecha_vencimiento, usos_restantes, aplicado, fecha_aplicacion, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Cupón no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Cupón actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El código único del cupón ya existe.', error: error.message });
            }
            if (error.code === '23503') {
                return res.status(400).json({ message: 'El cliente o cupón predefinido especificado no existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar cupón');
        }
    });

    // DELETE cupon
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM cupon WHERE id_cupon = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Cupón no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Cupón eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar cupón');
        }
    });

    return router;
};

export default cuponesRoutes;