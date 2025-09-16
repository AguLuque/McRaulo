import { Router } from 'express';

const ingredientesRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los ingredientes
    router.get('/', async (req, res) => {
        try {
            const result = await db.any('SELECT * FROM ingredientes');
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener ingredientes');
        }
    });

    // GET ingrediente por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM ingredientes WHERE id_ingrediente = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Ingrediente no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener ingrediente por ID');
        }
    });

    // POST nuevo ingrediente
    router.post('/nuevo_ingrediente', async (req, res) => {
        const { nombre, descripcion, precio, stock, unidad_medida } = req.body;
        if (!nombre || typeof precio === 'undefined' || typeof stock === 'undefined') {
            return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, precio, stock.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO ingredientes (nombre, descripcion, precio, stock, unidad_medida) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [nombre, descripcion, precio, stock, unidad_medida]
            );
            res.status(201).json({ message: 'Ingrediente creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del ingrediente ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear ingrediente');
        }
    });

    // PUT actualizar ingrediente
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, unidad_medida } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE ingredientes SET nombre = $1, descripcion = $2, precio = $3, stock = $4, unidad_medida = $5 WHERE id_ingrediente = $6 RETURNING *',
                [nombre, descripcion, precio, stock, unidad_medida, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Ingrediente no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Ingrediente actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El nombre del ingrediente ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar ingrediente');
        }
    });

    // DELETE ingrediente
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM ingredientes WHERE id_ingrediente = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Ingrediente no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Ingrediente eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar ingrediente');
        }
    });

    return router;
};

export default ingredientesRoutes;