const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Ruta para el LOGIN
router.post('/login', async (req, res) => {
    // Supabase Auth usa correo electrónico (email) y contraseña
    const { email, password } = req.body;

    try {
        // 1. Autenticar directamente con Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        // Si hay error en las credenciales
        if (error) {
            return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos", detalle: error.message });
        }

        // 2. Enviar respuesta exitosa
        // Supabase ya nos devuelve un token (access_token) y los datos del usuario autenticado
        res.json({ 
            mensaje: "¡Acceso concedido!", 
            token: data.session.access_token, 
            user: data.user
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

module.exports = router;