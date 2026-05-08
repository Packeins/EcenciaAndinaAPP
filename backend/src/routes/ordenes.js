const express = require('express');
const router = express.Router();
const { getAdminClient } = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['administrador', 'caja']));

// CREAR UNA NUEVA ORDEN
router.post('/', async (req, res) => {
  const { id_cliente, id_estado, id_origen, canal_origen, observaciones, detalles } = req.body;

  try {
    const adminClient = getAdminClient();
    // 1. Crear la cabecera de la Orden
    const { data: orden, error: errorOrden } = await adminClient
      .from('ordenes')
      .insert([{ id_cliente, id_estado, id_origen, canal_origen, observaciones, created_by: req.user.id }])
      .select()
      .single();

    if (errorOrden) throw errorOrden;

    // 2. Insertar los detalles de la Orden
    const detallesAInsertar = detalles.map((det) => ({
      id_orden: orden.id_orden,
      id_producto: det.id_producto,
      cantidad: det.cantidad,
      precio_aplicado: det.precio_aplicado,
      opciones: det.opciones || {},
      created_by: req.user.id,
      updated_by: req.user.id,
    }));

    const { error: errorDetalles } = await adminClient.from('detalle_orden').insert(detallesAInsertar);

    if (errorDetalles) throw errorDetalles;

    res.status(201).json({ mensaje: 'Orden registrada exitosamente', orden });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OBTENER TODAS LAS ORDENES
router.get('/', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    
    // Fetch orders with related data
    const { data: ordenes, error: errorOrdenes } = await adminClient
      .from('ordenes')
      .select(`
        id_orden,
        id_estado,
        created_at,
        canal_origen,
        observaciones,
        created_by,
        clientes ( nombre, apellido, telefono, tipos_cliente ( nombre_tipo ) ),
        estados_orden ( nombre_estado ),
        origenes_pedido ( nombre_origen ),
        detalle_orden (
          id_detalle,
          id_producto,
          cantidad,
          precio_aplicado,
          opciones,
          productos ( nombre_producto )
        )
      `)
      .order('created_at', { ascending: false });

    if (errorOrdenes) throw errorOrdenes;

    // Fetch employees to map creator names
    const { data: empleados, error: errorEmpleados } = await adminClient
      .from('empleados')
      .select('id, nombre, apellido');

    if (errorEmpleados) throw errorEmpleados;

    // Map creator names
    const ordenesConCreador = ordenes.map(orden => {
      const empleado = empleados.find(emp => emp.id === orden.created_by);
      return {
        ...orden,
        creador_nombre: empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Sistema/Desconocido'
      };
    });

    res.json(ordenesConCreador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ACTUALIZAR ORDEN COMPLETA
router.put('/:id', async (req, res) => {
  const { observaciones, detalles } = req.body;
  const id_orden = req.params.id;

  try {
    const adminClient = getAdminClient();
    
    // 1. Actualizar la cabecera
    const { error: errorOrden } = await adminClient
      .from('ordenes')
      .update({ observaciones, updated_by: req.user.id })
      .eq('id_orden', id_orden);

    if (errorOrden) throw errorOrden;

    // 2. Eliminar detalles anteriores
    const { error: errorDelete } = await adminClient
      .from('detalle_orden')
      .delete()
      .eq('id_orden', id_orden);

    if (errorDelete) throw errorDelete;

    // 3. Insertar nuevos detalles
    const detallesAInsertar = detalles.map((det) => ({
      id_orden: id_orden,
      id_producto: det.id_producto,
      cantidad: det.cantidad,
      precio_aplicado: det.precio_aplicado,
      opciones: det.opciones || {},
      created_by: req.user.id,
      updated_by: req.user.id,
    }));

    const { error: errorDetalles } = await adminClient.from('detalle_orden').insert(detallesAInsertar);

    if (errorDetalles) throw errorDetalles;

    res.json({ mensaje: 'Orden actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ACTUALIZAR ESTADO DE LA ORDEN
router.put('/:id/estado', async (req, res) => {
  const { id_estado } = req.body;
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('ordenes')
      .update({ id_estado })
      .eq('id_orden', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ mensaje: 'Estado actualizado', orden: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
