/*import { Router } from 'express';

const cuponesPredefinidosRoutes = (db, handleError) => {
    const router = Router();
    
    // GET cupon predefinido por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM cupon_predefinido WHERE id_cupon_predefinido = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Cupón predefinido no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener cupón predefinido por ID');
        }
    });

    // POST nuevo cupon predefinido
    router.post('/', async (req, res) => {
        const { codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo } = req.body;
        if (!codigo || !tipo_descuento || !fecha_inicio_validez || !fecha_fin_validez) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: codigo, tipo_descuento, fecha_inicio_validez, fecha_fin_validez.' });
        }
        try {
            const result = await db.one(
                'INSERT INTO cupon_predefinido (codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo]
            );
            res.status(201).json({ message: 'Cupón predefinido creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El código del cupón predefinido ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear cupón predefinido');
        }
    });

    // PUT actualizar cupon predefinido
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo } = req.body;
        try {
            const result = await db.oneOrNone(
                'UPDATE cupon_predefinido SET codigo = $1, tipo_descuento = $2, valor_descuento = $3, monto_minimo_compra = $4, fecha_inicio_validez = $5, fecha_fin_validez = $6, limite_usos_por_cliente = $7, limite_usos_total = $8, activo = $9 WHERE id_cupon_predefinido = $10 RETURNING *',
                [codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Cupón predefinido no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Cupón actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El código del cupón predefinido ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar cupón predefinido');
        }
    });

    // DELETE cupon predefinido
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('DELETE FROM cupon_predefinido WHERE id_cupon_predefinido = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Cupón predefinido no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Cupón eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar cupón predefinido');
        }
    });

    return router;
};

export default cuponesPredefinidosRoutes;*/

import { Router } from 'express';

const cuponesPredefinidosRoutes = (db, handleError) => {
    const router = Router();
    
    // GET todos los cupones predefinidos (FALTABA ESTE ENDPOINT)
    router.get('/', async (req, res) => {
        try {
            const result = await db.any(`
                SELECT 
                    id_cupon_predefinido,
                    codigo,
                    tipo_descuento,
                    valor_descuento,
                    monto_minimo_compra,
                    fecha_inicio_validez,
                    fecha_fin_validez,
                    limite_usos_por_cliente,
                    limite_usos_total,
                    activo,
                    fecha_creacion,
                    fecha_actualizacion
                FROM cupon_predefinido 
                ORDER BY fecha_creacion DESC
            `);
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener cupones predefinidos');
        }
    });
    
    // GET cupon predefinido por ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.oneOrNone('SELECT * FROM cupon_predefinido WHERE id_cupon_predefinido = $1', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Cupón predefinido no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'Error al obtener cupón predefinido por ID');
        }
    });

    // POST nuevo cupon predefinido
    router.post('/', async (req, res) => {
        const { codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo } = req.body;
        if (!codigo || !tipo_descuento || !fecha_inicio_validez || !fecha_fin_validez) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: codigo, tipo_descuento, fecha_inicio_validez, fecha_fin_validez.' });
        }
        
        // Validar tipo de descuento
        if (!['porcentaje', 'monto_fijo'].includes(tipo_descuento)) {
            return res.status(400).json({ message: 'tipo_descuento debe ser "porcentaje" o "monto_fijo"' });
        }
        
        try {
            const result = await db.one(
                'INSERT INTO cupon_predefinido (codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo ?? true]
            );
            res.status(201).json({ message: 'Cupón predefinido creado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El código del cupón predefinido ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al crear cupón predefinido');
        }
    });

    // PUT actualizar cupon predefinido
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo } = req.body;
        
        // Validar tipo de descuento si se proporciona
        if (tipo_descuento && !['porcentaje', 'monto_fijo'].includes(tipo_descuento)) {
            return res.status(400).json({ message: 'tipo_descuento debe ser "porcentaje" o "monto_fijo"' });
        }
        
        try {
            const result = await db.oneOrNone(
                'UPDATE cupon_predefinido SET codigo = $1, tipo_descuento = $2, valor_descuento = $3, monto_minimo_compra = $4, fecha_inicio_validez = $5, fecha_fin_validez = $6, limite_usos_por_cliente = $7, limite_usos_total = $8, activo = $9, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_cupon_predefinido = $10 RETURNING *',
                [codigo, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio_validez, fecha_fin_validez, limite_usos_por_cliente, limite_usos_total, activo, id]
            );
            if (!result) {
                return res.status(404).json({ message: 'Cupón predefinido no encontrado para actualizar' });
            }
            res.status(200).json({ message: 'Cupón actualizado con éxito', data: result });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ message: 'El código del cupón predefinido ya existe.', error: error.message });
            }
            handleError(res, error, 'Error al actualizar cupón predefinido');
        }
    });

    // DELETE cupon predefinido
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            // Verificar si hay cupones generados basados en este predefinido
            const cuponesGenerados = await db.oneOrNone(
                'SELECT COUNT(*) as count FROM cupon WHERE id_cupon_predefinido = $1', 
                [id]
            );
            
            if (cuponesGenerados && parseInt(cuponesGenerados.count) > 0) {
                return res.status(400).json({ 
                    message: `No se puede eliminar el cupón predefinido porque tiene ${cuponesGenerados.count} cupones generados asociados` 
                });
            }
            
            const result = await db.oneOrNone('DELETE FROM cupon_predefinido WHERE id_cupon_predefinido = $1 RETURNING *', [id]);
            if (!result) {
                return res.status(404).json({ message: 'Cupón predefinido no encontrado para eliminar' });
            }
            res.status(200).json({ message: 'Cupón eliminado con éxito', data: result });
        } catch (error) {
            handleError(res, error, 'Error al eliminar cupón predefinido');
        }
    });

    return router;
};

export default cuponesPredefinidosRoutes;