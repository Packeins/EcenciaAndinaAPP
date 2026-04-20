const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// CREAR UNA NUEVA ORDEN
router.post('/', async (req, res) => {
    const { id_cliente, id_estado, id_origen, canal_origen, detalles } = req.body;
    
    // detalles es un array: [{ id_producto: 1, cantidad: 2, precio_aplicado: 3.50 }]

    try {
        // 1. Crear la cabecera de la Orden
        const { data: orden, error: errorOrden } = await supabase
            .from('Ordenes')
            .insert([{ id_cliente, id_estado, id_origen, canal_origen, created_by: req.user.id }])
            .select()
            .single();

        if (errorOrden) throw errorOrden;

        // 2. Insertar los detalles de la Orden
        const detallesAInsertar = detalles.map(det => ({
            id_orden: orden.id_orden,
            id_producto: det.id_producto,
            cantidad: det.cantidad,
            precio_aplicado: det.precio_aplicado,
            updated_by: req.user.id
        }));

        const { error: errorDetalles } = await supabase
            .from('Detalle_Orden')
            .insert(detallesAInsertar);

        if (errorDetalles) throw errorDetalles;

        res.status(201).json({ mensaje: "Orden registrada exitosamente", orden });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
