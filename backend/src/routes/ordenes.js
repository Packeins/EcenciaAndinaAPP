const express = require('express');
const router = express.Router();
const { getAdminClient } = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['administrador', 'caja']));

// CREAR UNA NUEVA ORDEN
router.post('/', async (req, res) => {
  const { id_cliente, id_estado, id_origen, canal_origen, detalles } = req.body;

  try {
    const adminClient = getAdminClient();
    // 1. Crear la cabecera de la Orden
    const { data: orden, error: errorOrden } = await adminClient
      .from('ordenes')
      .insert([{ id_cliente, id_estado, id_origen, canal_origen, created_by: req.user.id }])
      .select()
      .single();

    if (errorOrden) throw errorOrden;

    // 2. Insertar los detalles de la Orden
    const detallesAInsertar = detalles.map((det) => ({
      id_orden: orden.id_orden,
      id_producto: det.id_producto,
      cantidad: det.cantidad,
      precio_aplicado: det.precio_aplicado,
      updated_by: req.user.id,
    }));

    const { error: errorDetalles } = await adminClient.from('detalle_orden').insert(detallesAInsertar);

    if (errorDetalles) throw errorDetalles;

    res.status(201).json({ mensaje: 'Orden registrada exitosamente', orden });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
