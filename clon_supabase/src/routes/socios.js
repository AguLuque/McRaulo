import { Router } from 'express';

const socios = (db, handleError) => {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const result = await db.any('SELECT * FROM socios ORDER BY fecha_registro DESC');
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, 'Error al obtener socios');
    }
  });

  router.get('/:dni', async (req, res) => {
    const { dni } = req.params;
    try {
      const socio = await db.oneOrNone('SELECT * FROM socios WHERE dni = $1', [dni]);
      if (!socio) {
        return res.status(404).json({ socio: false });
      }
      res.status(200).json({ socio: true, socioData: socio });
    } catch (error) {
      handleError(res, error, 'Error al verificar socio');
    }
  });

  router.post('/', async (req, res) => {
    const { dni, nombre = 'Nuevo socio' } = req.body;

    if (!dni) {
      return res.status(400).json({ error: 'El campo DNI es obligatorio' });
    }

    try {
      // Verificar si ya existe
      const existente = await db.oneOrNone('SELECT * FROM socios WHERE dni = $1', [dni]);
      if (existente) {
        return res.status(400).json({ error: 'El socio ya está registrado' });
      }

      // Insertar nuevo socio
      const nuevoSocio = await db.one(
        'INSERT INTO socios (dni, nombre, activo, fecha_registro) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [dni, nombre, true]
      );

      res.status(201).json({ message: 'Socio registrado con éxito', socio: nuevoSocio });
    } catch (error) {
      handleError(res, error, 'Error al registrar socio');
    }
  });

  return router;
};

export default socios;
