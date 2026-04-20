const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// BUSCAR CLIENTE POR CÉDULA
router.get('/buscar/:cedula', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Clientes')
            .select(`
                *,
                Tipos_Cliente(nombre_tipo),
                Saldos_Servicio(cantidad_disponible, Productos(nombre_producto))
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
            .from('Clientes')
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
