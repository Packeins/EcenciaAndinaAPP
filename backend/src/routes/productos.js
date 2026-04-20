const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de productos estarán protegidas
router.use(authMiddleware);

// OBTENER TODOS LOS PRODUCTOS (ej. para mostrar en caja)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Productos')
            .select(`
                id_producto,
                nombre_producto,
                precio_unitario,
                Categorias_Productos (nombre_categoria)
            `);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREAR NUEVO PRODUCTO
router.post('/', async (req, res) => {
    const { id_categoria, nombre_producto, precio_unitario } = req.body;
    
    try {
        const { data, error } = await supabase
            .from('Productos')
            .insert([
                { 
                    id_categoria, 
                    nombre_producto, 
                    precio_unitario,
                    created_by: req.user.id // Auditoría automática
                }
            ])
            .select();

        if (error) throw error;
        res.status(201).json({ mensaje: "Producto creado exitosamente", producto: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
