const express = require('express');
const db = require('./src/config/db'); // Asegúrate de que la ruta sea correcta
const app = express();

// Middleware para entender JSON (lo necesitaremos luego para el login)
app.use(express.json());

// 1. Ruta base para probar que el servidor vive
app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

// 2. Ruta para probar la conexión a la base de datos
app.get('/api/check-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT usuario, rol FROM Usuarios_Internos LIMIT 1');
    res.json({
      mensaje: "Backend y Base de datos conectados",
      datos_prueba: rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error en la base de datos", 
      detalle: error.message 
    });
  }
});

// Un solo listen para todo el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});