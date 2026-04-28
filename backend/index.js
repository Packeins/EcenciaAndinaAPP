require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./src/config/supabase'); // Configuración de Supabase
const authRoutes = require('./src/routes/auth'); // Importamos las nuevas rutas de login

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- RUTAS ---

// 1. Ruta base de prueba
app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀 (Migrado a Supabase)');
});

// 2. Ruta para verificar la base de datos (Supabase)
app.get('/api/check-db', async (req, res) => {
  try {
    // Si tienes una tabla Empleados en Supabase, esto funcionará.
    // Caso contrario, al menos verificamos que el cliente no se caiga.
    const { data, error } = await supabase.from('empleados').select('*').limit(1);

    if (error) {
      throw error;
    }

    res.json({
      mensaje: 'Backend y Supabase conectados exitosamente',
      datos_prueba: data,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error conectando a Supabase',
      detalle: error.message,
    });
  }
});

// 3. Conexión de las Rutas de la API
// Esto significa que todas las rutas empezarán con /api/...
app.use('/api/auth', authRoutes);
app.use('/api/productos', require('./src/routes/productos'));
app.use('/api/clientes', require('./src/routes/clientes'));
app.use('/api/ordenes', require('./src/routes/ordenes'));
app.use('/api/convenios', require('./src/routes/convenios'));
app.use('/api/empleados', require('./src/routes/empleados'));
app.use('/api/categorias', require('./src/routes/categorias'));

// --- INICIO DEL SERVIDOR ---
const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔑 Rutas de autenticación listas en http://localhost:${PORT}/api/auth/login`);
});

// Manejo de cierre limpio (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Recibido SIGINT. Cerrando servidor de forma limpia...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibido SIGTERM. Cerrando servidor...');
  server.close(() => {
    process.exit(0);
  });
});
