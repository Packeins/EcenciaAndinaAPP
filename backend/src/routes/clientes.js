const express = require('express');
const router = express.Router();
const { supabase, getAdminClient } = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['administrador']));

// Función auxiliar para formatear cliente con su convenio
const formatCliente = (cli) => {
  const convenioRel = cli.clientes_convenios?.[0]?.convenios;
  return {
    id: cli.id_cliente,
    cedula: cli.cedula,
    nombre: cli.nombre,
    apellido: cli.apellido,
    telefono: cli.telefono || '',
    activo: cli.esta_activo,
    id_tipo_cliente: cli.id_tipo_cliente,
    tipo_nombre: cli.tipos_cliente?.nombre_tipo || 'Sin tipo',
    convenio: convenioRel ? {
      id: convenioRel.id_convenio,
      nombre: convenioRel.nombre_empresa
    } : null
  };
};

// OBTENER TODOS LOS CLIENTES
router.get('/', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('clientes')
      .select(`
        *,
        tipos_cliente(nombre_tipo),
        clientes_convenios(
          convenios(id_convenio, nombre_empresa)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(formatCliente));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OBTENER TIPOS DE CLIENTE
router.get('/tipos', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('tipos_cliente')
      .select('*')
      .order('nombre_tipo', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QUITAR CLIENTE DE CUALQUIER CONVENIO
router.delete('/:id/convenio', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { error } = await adminClient
      .from('clientes_convenios')
      .delete()
      .eq('id_cliente', req.params.id);

    if (error) throw error;
    res.json({ mensaje: 'Vínculo con convenio eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREAR NUEVO CLIENTE
router.post('/', async (req, res) => {
  const { cedula, nombre, apellido, telefono, id_tipo_cliente } = req.body;
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('clientes')
      .insert([{ cedula, nombre, apellido, telefono, id_tipo_cliente: id_tipo_cliente || 1, created_by: req.user.id }])
      .select('*, tipos_cliente(nombre_tipo), clientes_convenios(convenios(id_convenio, nombre_empresa))')
      .single();
    if (error) throw error;
    res.status(201).json(formatCliente(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ACTUALIZAR CLIENTE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { activo, cedula, nombre, apellido, telefono, id_tipo_cliente } = req.body;

  const actualizacion = { updated_by: req.user.id };
  if (activo !== undefined) actualizacion.esta_activo = activo;
  if (cedula) actualizacion.cedula = cedula;
  if (nombre) actualizacion.nombre = nombre;
  if (apellido) actualizacion.apellido = apellido;
  if (telefono !== undefined) actualizacion.telefono = telefono;
  if (id_tipo_cliente) actualizacion.id_tipo_cliente = id_tipo_cliente;

  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('clientes')
      .update(actualizacion)
      .eq('id_cliente', id)
      .select('*, tipos_cliente(nombre_tipo), clientes_convenios(convenios(id_convenio, nombre_empresa))')
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json(formatCliente(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
