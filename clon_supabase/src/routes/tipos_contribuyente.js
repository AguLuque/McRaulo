import { Router } from 'express';

const tiposContribuyenteRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los tipos de contribuyente
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM tipo_contribuyente');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener tipos de contribuyente');
        }
    });

    // GET tipo de contribuyente por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM tipo_contribuyente WHERE id_tipo_contribuyente = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Tipo de contribuyente no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener tipo de contribuyente por ID');
        }
    });

    // POST nuevo tipo de contribuyente
    router.post('/', async (req, res) => {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'Falta campo obligatorio: nombre.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO tipo_contribuyente (nombre) VALUES ($1) RETURNING *',
                [nombre]
            );
            res.status(201).json({ message: 'Tipo de contribuyente creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del tipo de contribuyente ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear tipo de contribuyente');
        }
    });

    // PUT actualizar tipo de contribuyente
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE tipo_contribuyente SET nombre = $1 WHERE id_tipo_contribuyente = $2 RETURNING *',
                [nombre, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Tipo de contribuyente no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Tipo de contribuyente actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del tipo de contribuyente ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar tipo de contribuyente');
        }
    });

    // DELETE tipo de contribuyente
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM tipo_contribuyente WHERE id_tipo_contribuyente = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Tipo de contribuyente no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Tipo de contribuyente eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar tipo de contribuyente');
        }
    });

    return router;
};

export default tiposContribuyenteRoutes;