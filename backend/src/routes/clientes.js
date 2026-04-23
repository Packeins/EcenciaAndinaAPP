const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// OBTENER TODOS LOS CLIENTES
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select(
        `
                id_cliente,
                cedula,
                nombre,
                apellido,
                telefono,
                esta_activo,
                created_at,
                id_tipo_cliente,
                tipos_cliente (
                    nombre_tipo
                )
            `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mapear al formato que espera el frontend
    const clientesFormateados = data.map((cli) => ({
      id: cli.id_cliente,
      cedula: cli.cedula,
      nombre: cli.nombre,
      apellido: cli.apellido,
      telefono: cli.telefono || '',
      activo: cli.esta_activo,
      id_tipo_cliente: cli.id_tipo_cliente,
      tipo_nombre: cli.tipos_cliente?.nombre_tipo || 'Sin tipo',
    }));

    res.json(clientesFormateados);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

// OBTENER TIPOS DE CLIENTE
router.get('/tipos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tipos_cliente')
      .select('*')
      .order('nombre_tipo', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BUSCAR CLIENTE POR CÉDULA
router.get('/buscar/:cedula', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select(
        `
                id_cliente,
                cedula,
                nombre,
                apellido,
                telefono,
                esta_activo
            `
      )
      .eq('cedula', req.params.cedula)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cliente no encontrado.' });
      }
      throw error;
    }

    res.json({
      id: data.id_cliente,
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono || '',
      activo: data.esta_activo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREAR NUEVO CLIENTE
router.post('/', async (req, res) => {
  const { cedula, nombre, apellido, telefono, id_tipo_cliente } = req.body;

  if (!cedula || !nombre || !apellido) {
    return res.status(400).json({ error: 'Cédula, nombre y apellido son obligatorios.' });
  }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([
        {
          cedula,
          nombre,
          apellido,
          telefono,
          id_tipo_cliente: id_tipo_cliente || 1, // Por defecto 'Frecuente' si no se especifica
          created_by: req.user.id,
        },
      ])
      .select(
        `
                *,
                tipos_cliente (nombre_tipo)
            `
      )
      .single();

    if (error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Ya existe un cliente con esta cédula.' });
      }
      throw error;
    }

    const clienteFormateado = {
      id: data.id_cliente,
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono || '',
      activo: data.esta_activo,
      id_tipo_cliente: data.id_tipo_cliente,
      tipo_nombre: data.tipos_cliente?.nombre_tipo || 'Sin tipo',
    };

    res.status(201).json(clienteFormateado);
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ACTUALIZAR DATOS DE UN CLIENTE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { activo, cedula, nombre, apellido, telefono, id_tipo_cliente } = req.body;

  const actualizacion = { updated_by: req.user.id };
  if (activo !== undefined) actualizacion.esta_activo = activo;
  if (cedula !== undefined) actualizacion.cedula = cedula;
  if (nombre !== undefined) actualizacion.nombre = nombre;
  if (apellido !== undefined) actualizacion.apellido = apellido;
  if (telefono !== undefined) actualizacion.telefono = telefono;
  if (id_tipo_cliente !== undefined) actualizacion.id_tipo_cliente = id_tipo_cliente;

  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(actualizacion)
      .eq('id_cliente', id)
      .select(
        `
                *,
                tipos_cliente (nombre_tipo)
            `
      )
      .single();

    if (error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Ya existe un cliente con esta cédula.' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    const clienteFormateado = {
      id: data.id_cliente,
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono || '',
      activo: data.esta_activo,
      id_tipo_cliente: data.id_tipo_cliente,
      tipo_nombre: data.tipos_cliente?.nombre_tipo || 'Sin tipo',
    };

    res.json(clienteFormateado);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
