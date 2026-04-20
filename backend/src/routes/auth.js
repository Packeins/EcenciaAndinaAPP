const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para el LOGIN (Aún disponible por si necesitas probar desde Postman)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos", detalle: error.message });
        }
        res.json({ mensaje: "¡Acceso concedido!", token: data.session.access_token, user: data.user });
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno del servidor" });
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

module.exports = router;