const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// OBTENER TODOS LOS CONVENIOS
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('convenios')
      .select(
        `
                id_convenio,
                ruc,
                nombre_empresa,
                representante,
                telefono,
                email,
                fecha_inicio,
                fecha_caducidad,
                esta_activo,
                created_at
            `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mapear al formato que espera el frontend
    const conveniosFormateados = data.map((conv) => ({
      id: conv.id_convenio,
      ruc: conv.ruc,
      nombre_empresa: conv.nombre_empresa,
      representante: conv.representante || '',
      telefono: conv.telefono || '',
      email: conv.email || '',
      fecha_inicio: conv.fecha_inicio,
      fecha_caducidad: conv.fecha_caducidad,
      activo: conv.esta_activo,
      // TODO: Calcular cuando existan tablas Clientes y Clientes_Convenios
      totalColaboradores: 0,
      // TODO: Calcular cuando existan tablas Ordenes y Detalle_Orden
      consumoMensual: 0,
    }));

    res.json(conveniosFormateados);
  } catch (error) {
    console.error('Error obteniendo convenios:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREAR NUEVO CONVENIO
router.post('/', async (req, res) => {
  const { ruc, nombre_empresa, representante, telefono, email, fecha_inicio, fecha_caducidad } =
    req.body;

  // Validaciones básicas
  if (!ruc || !nombre_empresa || !fecha_inicio || !fecha_caducidad) {
    return res
      .status(400)
      .json({
        error: 'RUC, nombre de empresa, fecha de inicio y fecha de caducidad son obligatorios.',
      });
  }

  try {
    const { data, error } = await supabase
      .from('convenios')
      .insert([
        {
          ruc,
          nombre_empresa,
          representante,
          telefono,
          email,
          fecha_inicio,
          fecha_caducidad,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      // Manejar duplicado de RUC
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Ya existe un convenio con este RUC.' });
      }
      throw error;
    }

    // Devolver en el mismo formato que el GET
    const convenioFormateado = {
      id: data.id_convenio,
      ruc: data.ruc,
      nombre_empresa: data.nombre_empresa,
      representante: data.representante || '',
      telefono: data.telefono || '',
      email: data.email || '',
      fecha_inicio: data.fecha_inicio,
      fecha_caducidad: data.fecha_caducidad,
      activo: data.esta_activo,
      totalColaboradores: 0,
      consumoMensual: 0,
    };

    res.status(201).json(convenioFormateado);
  } catch (error) {
    console.error('Error creando convenio:', error);
    res.status(500).json({ error: error.message });
  }
});

// ACTUALIZAR DATOS DE UN CONVENIO
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    activo,
    ruc,
    nombre_empresa,
    representante,
    telefono,
    email,
    fecha_inicio,
    fecha_caducidad,
  } = req.body;

  const actualizacion = { updated_by: req.user.id };
  if (activo !== undefined) actualizacion.esta_activo = activo;
  if (ruc !== undefined) actualizacion.ruc = ruc;
  if (nombre_empresa !== undefined) actualizacion.nombre_empresa = nombre_empresa;
  if (representante !== undefined) actualizacion.representante = representante;
  if (telefono !== undefined) actualizacion.telefono = telefono;
  if (email !== undefined) actualizacion.email = email;
  if (fecha_inicio !== undefined) actualizacion.fecha_inicio = fecha_inicio;
  if (fecha_caducidad !== undefined) actualizacion.fecha_caducidad = fecha_caducidad;

  try {
    const { data, error } = await supabase
      .from('convenios')
      .update(actualizacion)
      .eq('id_convenio', id)
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Ya existe un convenio con este RUC.' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Convenio no encontrado.' });
    }

    // Devolver en el mismo formato que el GET
    const convenioFormateado = {
      id: data.id_convenio,
      ruc: data.ruc,
      nombre_empresa: data.nombre_empresa,
      representante: data.representante || '',
      telefono: data.telefono || '',
      email: data.email || '',
      fecha_inicio: data.fecha_inicio,
      fecha_caducidad: data.fecha_caducidad,
      activo: data.esta_activo,
      totalColaboradores: 0,
      consumoMensual: 0,
    };

    res.json(convenioFormateado);
  } catch (error) {
    console.error('Error actualizando convenio:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
