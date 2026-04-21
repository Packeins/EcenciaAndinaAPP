const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todos los empleados
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('empleados')
            .select(`
                id,
                nombre,
                apellido,
                correo,
                nombre_usuario,
                esta_activo,
                created_at,
                roles (nombre_rol)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar estado (activo/inactivo) de un empleado
router.put('/:id/estado', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { esta_activo } = req.body;

        const { data, error } = await supabase
            .from('empleados')
            .update({ esta_activo })
            .eq('id', id)
            .select();

        if (error) throw error;
        
        res.json({ mensaje: 'Estado actualizado correctamente', empleado: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener perfil propio (datos personales)
router.get('/perfil', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('empleados')
            .select(`*, roles (nombre_rol)`)
            .eq('id', userId)
            .single();

        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar perfil propio (datos personales)
router.put('/perfil', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombre, apellido, nombre_usuario } = req.body;

        const { data, error } = await supabase
            .from('empleados')
            .update({ nombre, apellido, nombre_usuario })
            .eq('id', userId)
            .select(`*, roles (nombre_rol)`)
            .single();

        if (error) throw error;
        
        res.json({ mensaje: 'Perfil actualizado correctamente', empleado: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar contraseña propia
router.put('/perfil/password', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;
        const token = req.headers.authorization.split(' ')[1]; // Extract token

        // Llamar a la API REST de GoTrue de Supabase directamente
        const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'apikey': process.env.SUPABASE_KEY
            },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.msg || err.message || 'Error al actualizar contraseña');
        }

        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enviar enlace de recuperación de contraseña a un empleado
router.post('/:id/reset-password', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener el correo del empleado
        const { data: empleado, error: empleadoError } = await supabase
            .from('empleados')
            .select('correo')
            .eq('id', id)
            .single();

        if (empleadoError || !empleado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        if (!empleado.correo) {
            return res.status(400).json({ error: 'El empleado no tiene un correo registrado' });
        }

        // Llamar a resetPasswordForEmail
        const { error } = await supabase.auth.resetPasswordForEmail(empleado.correo);

        if (error) throw error;

        res.json({ mensaje: `Se ha enviado un enlace de recuperación a ${empleado.correo}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar contraseña de un empleado manualmente (Requiere SERVICE_ROLE_KEY)
router.put('/:id/password', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return res.status(500).json({ error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor' });
        }

        const { createClient } = require('@supabase/supabase-js');
        const adminSupabase = createClient(process.env.SUPABASE_URL, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data, error } = await adminSupabase.auth.admin.updateUserById(
            id,
            { password: password }
        );

        if (error) throw error;

        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
