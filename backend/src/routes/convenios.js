const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// OBTENER TODOS LOS CONVENIOS
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Convenios')
            .select(`
                id_convenio,
                nombre_empresa,
                representante,
                telefono,
                email,
                esta_activo,
                Clientes_Convenios(count)
            `);

        if (error) throw error;

        // Formatear los datos para que coincidan exactamente con lo que espera el Frontend de Lovable
        const conveniosFormateados = data.map(conv => ({
            id: conv.id_convenio,
            nombre: `Convenio ${conv.nombre_empresa}`, // El front espera un nombre de convenio
            empresa: conv.nombre_empresa,
            contacto: conv.representante, // Traducción del campo
            telefono: conv.telefono,
            email: conv.email,
            activo: conv.esta_activo,
            colaboradores: new Array(conv.Clientes_Convenios[0]?.count || 0).fill(''), // Array vacío simulando colaboradores
            consumoMensual: 0 // Esto se calcularía luego con las órdenes
        }));

        res.json(conveniosFormateados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREAR NUEVO CONVENIO
router.post('/', async (req, res) => {
    // Recibimos los datos con los nombres del Frontend
    const { nombre, empresa, contacto, telefono, email } = req.body;
    
    try {
        const { data, error } = await supabase
            .from('Convenios')
            .insert([
                { 
                    nombre_empresa: empresa, 
                    representante: contacto, 
                    telefono, 
                    email,
                    created_by: req.user.id
                }
            ])
            .select();

        if (error) throw error;
        res.status(201).json({ mensaje: "Convenio creado", convenio: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ACTUALIZAR ESTADO O DATOS DEL CONVENIO
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    // Si viene 'activo' del front, lo mapeamos a 'esta_activo' en la BD
    const { activo, empresa, contacto, telefono, email } = req.body;
    
    const actualizacion = { updated_by: req.user.id };
    if (activo !== undefined) actualizacion.esta_activo = activo;
    if (empresa !== undefined) actualizacion.nombre_empresa = empresa;
    if (contacto !== undefined) actualizacion.representante = contacto;
    if (telefono !== undefined) actualizacion.telefono = telefono;
    if (email !== undefined) actualizacion.email = email;

    try {
        const { data, error } = await supabase
            .from('Convenios')
            .update(actualizacion)
            .eq('id_convenio', id)
            .select();

        if (error) throw error;
        res.json({ mensaje: "Convenio actualizado", convenio: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
