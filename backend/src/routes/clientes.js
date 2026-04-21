const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// BUSCAR CLIENTE POR CÉDULA
router.get('/buscar/:cedula', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select(`
                *,
                tipos_cliente(nombre_tipo),
                saldos_servicio(cantidad_disponible, productos(nombre_producto))
            `)
            .eq('cedula', req.params.cedula)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// REGISTRAR NUEVO CLIENTE FRECUENTE
router.post('/', async (req, res) => {
    const { cedula, nombre, apellido, telefono, id_tipo_cliente } = req.body;
    
    try {
        const { data, error } = await supabase
            .from('clientes')
            .insert([
                { cedula, nombre, apellido, telefono, id_tipo_cliente, created_by: req.user.id }
            ])
            .select();

        if (error) throw error;
        res.status(201).json({ mensaje: "Cliente registrado", cliente: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
