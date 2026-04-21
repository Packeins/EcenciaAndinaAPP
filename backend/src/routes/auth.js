const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para el LOGIN (Aún disponible por si necesitas probar desde Postman)
router.post('/login', async (req, res) => {
    // Aceptamos 'identificador' que puede ser correo o nombre de usuario
    const { identificador, password } = req.body;
    
    // Por retrocompatibilidad, si envían 'email' lo usamos como identificador
    const loginId = identificador || req.body.email;

    if (!loginId || !password) {
        return res.status(400).json({ mensaje: "El identificador (correo/usuario) y contraseña son obligatorios" });
    }

    try {
        let emailToLogin = loginId;

        // Si no tiene '@', asumimos que es un nombre de usuario y buscamos su correo en la BD
        if (!loginId.includes('@')) {
            const { data: empleado, error: empError } = await supabase
                .from('empleados')
                .select('correo')
                .eq('nombre_usuario', loginId)
                .single();
            
            if (empError || !empleado || !empleado.correo) {
                return res.status(401).json({ mensaje: "Usuario no encontrado o no tiene correo asociado" });
            }
            emailToLogin = empleado.correo;
        }

        // Iniciamos sesión en Supabase Auth con el correo resuelto
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: emailToLogin, 
            password 
        });

        if (error || !data.user) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        // Fetch employee details and role
        const { data: empleadoData } = await supabase
            .from('empleados')
            .select(`
                *,
                roles (nombre_rol)
            `)
            .eq('id', data.user.id)
            .single();
            
        // Verificar si el empleado fue desactivado
        if (empleadoData && empleadoData.esta_activo === false) {
            return res.status(403).json({ mensaje: "Su cuenta ha sido desactivada. Comuníquese con el administrador." });
        }
            
        let rolFrontend = 'caja';
        if (empleadoData?.roles?.nombre_rol?.toLowerCase() === 'administrativo') {
            rolFrontend = 'administrador';
        }

        res.json({ 
            mensaje: "¡Acceso concedido!", 
            token: data.session.access_token,
            refresh_token: data.session.refresh_token, 
            user: {
                id: empleadoData?.id || data.user.id,
                email: data.user.email,
                nombre: empleadoData?.nombre || '',
                apellido: empleadoData?.apellido || '',
                nombre_usuario: empleadoData?.nombre_usuario || '',
                rol: rolFrontend
            } 
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno del servidor", detalle: error.message });
    }
});

// NUEVA RUTA: Ruta Protegida de Prueba
// Solo puedes acceder si envías un Token válido en las cabeceras (Headers)
router.get('/datos-privados', authMiddleware, async (req, res) => {
    // Si el código llega hasta aquí, significa que el middleware lo dejó pasar
    res.json({
        mensaje: "¡BINGO! Has accedido a una zona segura del backend.",
        usuario_autenticado: req.user.email,
        id_usuario: req.user.id
    });
});

// NUEVA RUTA: Refrescar Token
router.post('/refresh', async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: "Refresh token es obligatorio" });
    }

    try {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token });

        if (error || !data.session) {
            return res.status(401).json({ error: "Sesión expirada o token de refresco inválido" });
        }

        res.json({
            token: data.session.access_token,
            refresh_token: data.session.refresh_token
        });
    } catch (err) {
        res.status(500).json({ error: "Error refrescando la sesión" });
    }
});

module.exports = router;