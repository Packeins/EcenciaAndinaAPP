const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ruta para el LOGIN
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // 1. Buscar al usuario en la base de datos
        const [rows] = await db.query('SELECT * FROM Usuarios_Internos WHERE usuario = ?', [usuario]);
        
        if (rows.length === 0) {
            return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        const user = rows[0];

        // 2. Comparar la contraseña (limpiando espacios) con el Hash de la DB
        const esValida = await bcrypt.compare(password.trim(), user.password.trim());

        if (!esValida) {
            return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        // 3. Crear el Token (JWT)
        // Usamos una clave secreta (lo ideal es que esté en .env más adelante)
        const token = jwt.sign(
            { id: user.id_usuario, nombre: user.usuario, rol: user.rol }, 
            process.env.JWT_SECRET || 'clave_secreta_provisional', 
            { expiresIn: '8h' }
        );

        // 4. Enviar respuesta exitosa (sin enviar el password al frontend por seguridad)
        const { password: _, ...userSinPassword } = user; // Esto quita el password del objeto
        res.json({ 
            mensaje: "¡Acceso concedido!", 
            token, 
            user: userSinPassword 
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

module.exports = router;