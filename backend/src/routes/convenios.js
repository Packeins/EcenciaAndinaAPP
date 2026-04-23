const express = require('express');
const router = express.Router();
const { supabase, getAdminClient } = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Función auxiliar para formatear la respuesta del convenio
const formatConvenio = (conv) => ({
  id: conv.id_convenio,
  ruc: conv.ruc,
  nombre_empresa: conv.nombre_empresa,
  representante: conv.representante || '',
  telefono: conv.telefono || '',
  email: conv.email || '',
  fecha_inicio: conv.fecha_inicio,
  fecha_caducidad: conv.fecha_caducidad,
  activo: conv.esta_activo,
  totalColaboradores: conv.clientes_convenios?.[0]?.count || 0,
  consumoMensual: 0, 
});

// OBTENER TODOS LOS CONVENIOS
router.get('/', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('convenios')
      .select('*, clientes_convenios(count)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(formatConvenio));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OBTENER CLIENTES DE UN CONVENIO
router.get('/:id/clientes', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('clientes_convenios')
      .select('clientes(id_cliente, cedula, nombre, apellido)')
      .eq('id_convenio', req.params.id);
    if (error) throw error;
    res.json(data.map(item => ({
      id: item.clientes.id_cliente,
      cedula: item.clientes.cedula,
      nombre: item.clientes.nombre,
      apellido: item.clientes.apellido
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AGREGAR CLIENTE EXISTENTE A CONVENIO
router.post('/:id/clientes', async (req, res) => {
  const { id_cliente } = req.body;
  const { id: id_convenio } = req.params;
  try {
    const adminClient = getAdminClient();
    const { data: cliente, error: cliError } = await adminClient.from('clientes').select('id_tipo_cliente').eq('id_cliente', id_cliente).single();
    if (cliError || !cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
    if (cliente.id_tipo_cliente !== 1) return res.status(400).json({ error: 'Este cliente es de tipo Frecuente.' });
    const { error: insError } = await adminClient.from('clientes_convenios').insert([{ id_cliente, id_convenio, created_by: req.user.id }]);
    if (insError) throw insError;
    res.status(201).json({ mensaje: 'Cliente agregado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREAR Y AGREGAR NUEVO CLIENTE A CONVENIO
router.post('/:id/clientes/nuevo', async (req, res) => {
  const { id: id_convenio } = req.params;
  const { cedula, nombre, apellido, telefono } = req.body;

  try {
    const adminClient = getAdminClient();
    
    // 1. Crear el cliente (Siempre tipo Convenio: ID 1)
    const { data: newClient, error: clientError } = await adminClient
      .from('clientes')
      .insert([{
        cedula,
        nombre,
        apellido,
        telefono,
        id_tipo_cliente: 1, // Tipo Convenio
        created_by: req.user.id
      }])
      .select()
      .single();

    if (clientError) {
      if (clientError.message.includes('duplicate key')) return res.status(400).json({ error: 'Ya existe un cliente con esta cédula.' });
      throw clientError;
    }

    // 2. Vincularlo al convenio
    const { error: linkError } = await adminClient
      .from('clientes_convenios')
      .insert([{
        id_cliente: newClient.id_cliente,
        id_convenio,
        created_by: req.user.id
      }]);

    if (linkError) throw linkError;

    res.status(201).json({
      id: newClient.id_cliente,
      cedula: newClient.cedula,
      nombre: newClient.nombre,
      apellido: newClient.apellido
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QUITAR CLIENTE DE CONVENIO
router.delete('/:id/clientes/:clienteId', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { error } = await adminClient.from('clientes_convenios').delete().eq('id_convenio', req.params.id).eq('id_cliente', req.params.clienteId);
    if (error) throw error;
    res.json({ mensaje: 'Cliente retirado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREAR NUEVO CONVENIO
router.post('/', async (req, res) => {
  const { ruc, nombre_empresa, representante, telefono, email, fecha_inicio, fecha_caducidad } = req.body;
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('convenios')
      .insert([{ ruc, nombre_empresa, representante, telefono, email, fecha_inicio, fecha_caducidad, created_by: req.user.id }])
      .select(`*, clientes_convenios(count)`)
      .single();
    if (error) throw error;
    res.status(201).json(formatConvenio(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ACTUALIZAR CONVENIO
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { activo, ruc, nombre_empresa, ...rest } = req.body;
  const actualizacion = { ...rest, updated_by: req.user.id };
  if (activo !== undefined) actualizacion.esta_activo = activo;
  if (ruc) actualizacion.ruc = ruc;
  if (nombre_empresa) actualizacion.nombre_empresa = nombre_empresa;

  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient.from('convenios').update(actualizacion).eq('id_convenio', id).select(`*, clientes_convenios(count)`).single();
    if (error) throw error;
    res.json(formatConvenio(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
