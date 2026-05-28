const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config();
const cors = require('cors');
const { supabase } = require('./src/config/supabase'); // Configuración de Supabase
const authRoutes = require('./src/routes/auth'); // Importamos las nuevas rutas de login

const app = express();

// --- MIDDLEWARES ---
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origen no permitido por CORS'));
    },
  })
);
app.use(express.json({ limit: '15mb' }));

// Servir archivos estáticos de convenios
app.use('/uploads/convenios', express.static(path.join(__dirname, '../convenios')));

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
app.use('/api/reportes', require('./src/routes/reportes'));
app.use('/api/convenios', require('./src/routes/convenios'));
app.use('/api/empleados', require('./src/routes/empleados'));
app.use('/api/categorias', require('./src/routes/categorias'));
app.use('/api/alimentos', require('./src/routes/alimentos'));
app.use('/api/menu', require('./src/routes/menu'));

app.use((error, req, res, next) => {
  if (error?.message === 'Origen no permitido por CORS') {
    res.status(403).json({ error: 'Origen no permitido por CORS' });
    return;
  }
  next(error);
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3001;
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
