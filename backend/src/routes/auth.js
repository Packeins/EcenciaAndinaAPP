const express = require('express');
const router = express.Router();
const { supabase, getAdminClient } = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para el LOGIN
router.post('/login', async (req, res) => {
  const { identificador, password } = req.body;
  const loginId = identificador || req.body.email;

  if (!loginId || !password) {
    return res.status(400).json({ mensaje: 'Identificador y contraseña obligatorios' });
  }

  try {
    let emailToLogin = loginId;

    // Si es nombre de usuario, buscar correo
    if (!loginId.includes('@')) {
      const { data: empleado, error: empError } = await supabase
        .from('empleados')
        .select('correo')
        .eq('nombre_usuario', loginId)
        .single();

      if (empError || !empleado) {
        return res.status(401).json({ mensaje: 'Usuario no encontrado' });
      }
      emailToLogin = empleado.correo;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const uid = authData.user.id;
    const uemail = authData.user.email;

    // Búsqueda del empleado con un cliente fresco para evitar problemas de RLS/Sesión
    const adminClient = getAdminClient();

    let { data: empleadosData, error: dbError } = await adminClient
      .from('empleados')
      .select('*, roles(nombre_rol)')
      .eq('id', uid)
      .limit(1);

    // Fallback por correo si falla el ID
    if (!dbError && (!empleadosData || empleadosData.length === 0)) {
      const { data: fallbackData } = await adminClient
        .from('empleados')
        .select('*, roles(nombre_rol)')
        .eq('correo', uemail)
        .limit(1);
      if (fallbackData && fallbackData.length > 0) {
        empleadosData = fallbackData;
      }
    }

    const empleadoData = empleadosData && empleadosData.length > 0 ? empleadosData[0] : null;

    if (!empleadoData) {
      return res.status(404).json({ mensaje: 'Empleado no registrado en la base de datos' });
    }

    if (empleadoData.esta_activo === false) {
      return res.status(403).json({ mensaje: 'Su cuenta ha sido desactivada.' });
    }

    // Mapeo de Rol para el Frontend
    let rolFrontend = 'caja';
    const rawRoles = empleadoData.roles || empleadoData.Roles;
    const roleName = (Array.isArray(rawRoles) ? rawRoles[0]?.nombre_rol : rawRoles?.nombre_rol) || '';
    const normRole = roleName.toLowerCase().trim();

    if (['administrativo', 'administrador', 'admin'].includes(normRole)) {
      rolFrontend = 'administrador';
    }

    res.json({
      mensaje: '¡Acceso concedido!',
      token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: {
        id: empleadoData.id,
        email: uemail,
        nombre: empleadoData.nombre,
        apellido: empleadoData.apellido,
        nombre_usuario: empleadoData.nombre_usuario,
        rol: rolFrontend,
      },
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', detalle: error.message });
  }
});

router.get('/datos-privados', authMiddleware, async (req, res) => {
  res.json({
    mensaje: 'Zona segura',
    usuario_autenticado: req.user.email,
    id_usuario: req.user.id,
  });
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Token obligatorio' });
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: 'Sesión expirada' });
    res.json({ token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
