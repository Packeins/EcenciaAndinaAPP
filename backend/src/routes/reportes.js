const express = require('express');
const router = express.Router();
const { getAdminClient } = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['administrador', 'caja']));

// 1. REPORTE GENERAL DE VENTAS (INGRESOS)
router.get('/ventas', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { fecha_inicio, fecha_fin } = req.query;

    let query = adminClient
      .from('ordenes')
      .select(`
        id_orden, id_estado, metodo_pago, created_at,
        detalle_orden ( cantidad, precio_aplicado )
      `);

    if (fecha_inicio) query = query.gte('created_at', fecha_inicio);
    if (fecha_fin) query = query.lte('created_at', fecha_fin + 'T23:59:59.999Z');

    const { data: ordenes, error } = await query;
    if (error) throw error;

    // Solo tomamos en cuenta consumidos (id_estado = 2) para ingresos reales
    const consumidos = ordenes.filter(o => o.id_estado === 2);

    const resumen = {
      efectivo: { cantidad: 0, total: 0 },
      convenio: { cantidad: 0, total: 0 },
      saldo: { cantidad: 0, total: 0 },
      transferencia: { cantidad: 0, total: 0 },
      otros: { cantidad: 0, total: 0 }
    };

    consumidos.forEach(orden => {
      const metodo = orden.metodo_pago ? orden.metodo_pago.toLowerCase() : 'otros';
      
      let key = 'otros';
      if (metodo.includes('efectivo')) key = 'efectivo';
      else if (metodo.includes('convenio')) key = 'convenio';
      else if (metodo.includes('saldo') || metodo.includes('prepago')) key = 'saldo';
      else if (metodo.includes('transferencia')) key = 'transferencia';

      let platos = 0;
      let dinero = 0;

      orden.detalle_orden.forEach(det => {
        platos += det.cantidad;
        dinero += det.cantidad * det.precio_aplicado;
      });

      resumen[key].cantidad += platos;
      resumen[key].total += dinero;
    });

    const resultadoArray = Object.keys(resumen).map(k => ({
      metodo_pago: k.charAt(0).toUpperCase() + k.slice(1),
      cantidadAlmuerzos: resumen[k].cantidad,
      totalConsumo: resumen[k].total
    })).filter(r => r.cantidadAlmuerzos > 0);

    res.json(resultadoArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. REPORTE DE PEDIDOS POR ESTADO
router.get('/estados', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { fecha_inicio, fecha_fin, id_estado } = req.query;

    let query = adminClient
      .from('ordenes')
      .select(`
        id_orden, created_at, id_estado, metodo_pago,
        clientes ( nombre, apellido ),
        estados_orden ( nombre_estado ),
        detalle_orden ( cantidad, precio_aplicado, productos(nombre_producto) )
      `);

    if (fecha_inicio) query = query.gte('created_at', fecha_inicio);
    if (fecha_fin) query = query.lte('created_at', fecha_fin + 'T23:59:59.999Z');
    if (id_estado && id_estado !== 'all') query = query.eq('id_estado', id_estado);

    query = query.order('created_at', { ascending: false });

    const { data: ordenes, error } = await query;
    if (error) throw error;

    const reporteFormateado = ordenes.map(o => {
      const cantidadTotal = o.detalle_orden.reduce((sum, d) => sum + d.cantidad, 0);
      const montoTotal = o.detalle_orden.reduce((sum, d) => sum + (d.cantidad * d.precio_aplicado), 0);
      const descripciones = o.detalle_orden.map(d => `${d.cantidad}x ${d.productos?.nombre_producto}`).join(', ');

      return {
        id: o.id_orden,
        fecha: o.created_at,
        cliente: o.clientes ? `${o.clientes.nombre} ${o.clientes.apellido}` : 'Desconocido',
        estado: o.estados_orden?.nombre_estado || 'Desconocido',
        metodo_pago: o.metodo_pago || 'N/A',
        descripcion: descripciones,
        cantidadAlmuerzos: cantidadTotal,
        totalConsumo: montoTotal
      };
    });

    res.json(reporteFormateado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. REPORTE DE POPULARIDAD DE PRODUCTOS
router.get('/productos', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { fecha_inicio, fecha_fin } = req.query;

    let query = adminClient
      .from('ordenes')
      .select(`
        id_estado, created_at,
        detalle_orden ( cantidad, precio_aplicado, productos(nombre_producto, categorias_productos(nombre_categoria)) )
      `);

    if (fecha_inicio) query = query.gte('created_at', fecha_inicio);
    if (fecha_fin) query = query.lte('created_at', fecha_fin + 'T23:59:59.999Z');

    const { data: ordenes, error } = await query;
    if (error) throw error;

    // Solo contabilizar los consumidos
    const consumidos = ordenes.filter(o => o.id_estado === 2);

    const productosMap = {};

    consumidos.forEach(orden => {
      orden.detalle_orden.forEach(det => {
        const nombre = det.productos?.nombre_producto || 'Desconocido';
        const categoria = det.productos?.categorias_productos?.nombre_categoria || 'Otra';
        if (!productosMap[nombre]) {
          productosMap[nombre] = { nombre, categoria, cantidadVendida: 0, ingresosGenerados: 0 };
        }
        productosMap[nombre].cantidadVendida += det.cantidad;
        productosMap[nombre].ingresosGenerados += (det.cantidad * det.precio_aplicado);
      });
    });

    const resultadoArray = Object.values(productosMap).sort((a, b) => b.cantidadVendida - a.cantidadVendida);

    res.json(resultadoArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. REPORTE POR CLIENTE
router.get('/clientes', async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { fecha_inicio, fecha_fin, id_cliente } = req.query;

    if (!id_cliente || id_cliente === 'all') {
      return res.status(400).json({ error: 'Debe seleccionar un cliente específico.' });
    }

    let query = adminClient
      .from('ordenes')
      .select(`
        id_orden, created_at, id_estado, metodo_pago,
        estados_orden ( nombre_estado ),
        detalle_orden ( cantidad, precio_aplicado, productos(nombre_producto) )
      `)
      .eq('id_cliente', id_cliente);

    if (fecha_inicio) query = query.gte('created_at', fecha_inicio);
    if (fecha_fin) query = query.lte('created_at', fecha_fin + 'T23:59:59.999Z');

    query = query.order('created_at', { ascending: false });

    const { data: ordenes, error } = await query;
    if (error) throw error;

    const reporteFormateado = ordenes.map(o => {
      const cantidadTotal = o.detalle_orden.reduce((sum, d) => sum + d.cantidad, 0);
      const montoTotal = o.detalle_orden.reduce((sum, d) => sum + (d.cantidad * d.precio_aplicado), 0);
      const descripciones = o.detalle_orden.map(d => `${d.cantidad}x ${d.productos?.nombre_producto}`).join(', ');

      return {
        id: o.id_orden,
        fecha: o.created_at,
        estado: o.estados_orden?.nombre_estado || 'Desconocido',
        metodo_pago: o.metodo_pago || 'N/A',
        descripcion: descripciones,
        cantidadAlmuerzos: cantidadTotal,
        totalConsumo: montoTotal
      };
    });

    res.json(reporteFormateado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
