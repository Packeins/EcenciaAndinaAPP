const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todos los empleados
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select(
        `
                id,
                id_rol,
                nombre,
                apellido,
                correo,
                nombre_usuario,
                esta_activo,
                created_at,
                roles (nombre_rol)
            `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo empleado
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, apellido, correo, password, nombre_usuario, id_rol } = req.body;
    const creatorId = req.user.id;

    // 0. Validaciones de duplicados (Correo y Usuario)
    const { data: existingUser, error: checkError } = await supabase
      .from('empleados')
      .select('correo, nombre_usuario')
      .or(`correo.eq.${correo},nombre_usuario.eq.${nombre_usuario}`);

    if (checkError) throw checkError;

    if (existingUser && existingUser.length > 0) {
      const dupe = existingUser.find((u) => u.correo === correo);
      if (dupe) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      }
      const dupeUser = existingUser.find((u) => u.nombre_usuario === nombre_usuario);
      if (dupeUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
      }
    }

    // 1. Crear el usuario en la autenticación de Supabase (Auth)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: correo,
      password: password,
      email_confirm: true,
      user_metadata: { nombre, apellido, nombre_usuario },
    });

    if (authError) throw authError;

    // 2. Insertar los datos complementarios en la tabla 'empleados'
    const { data: empleadoData, error: dbError } = await supabase
      .from('empleados')
      .insert({
        id: authUser.user.id,
        nombre,
        apellido,
        correo,
        nombre_usuario,
        id_rol,
        esta_activo: true,
        created_by: creatorId,
        updated_by: creatorId,
      })
      .select(
        `
                id,
                id_rol,
                nombre,
                apellido,
                correo,
                nombre_usuario,
                esta_activo,
                created_at,
                roles (nombre_rol)
            `
      )
      .single();

    if (dbError) {
      // Si falla la BD, intentamos borrar el usuario de Auth para no dejar basura
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw dbError;
    }

    res.status(201).json(empleadoData);
  } catch (error) {
    console.error('Error creando empleado:', error);

    // Traducir errores comunes de Supabase Auth / DB
    const msgLower = (error.message || '').toLowerCase();
    let mensajeError = error.message;

    if (msgLower.includes('user already registered')) {
      mensajeError = 'Este correo electrónico ya está registrado.';
    } else if (msgLower.includes('password should be at least')) {
      mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (msgLower.includes('duplicate key') || msgLower.includes('unique constraint')) {
      mensajeError = 'Ya existe un empleado con este correo o nombre de usuario.';
    }

    res.status(500).json({ error: mensajeError });
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

// Actualizar datos de un empleado (nombre, apellido, usuario, rol)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, nombre_usuario, id_rol } = req.body;

    // Validación de usuario duplicado (si cambió)
    const { data: existingUser, error: checkError } = await supabase
      .from('empleados')
      .select('id')
      .eq('nombre_usuario', nombre_usuario)
      .neq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'El nombre de usuario ya está en uso por otro empleado.' });
    }

    const { data, error } = await supabase
      .from('empleados')
      .update({ nombre, apellido, nombre_usuario, id_rol })
      .eq('id', id)
      .select(
        `
                id,
                id_rol,
                nombre,
                apellido,
                correo,
                nombre_usuario,
                esta_activo,
                created_at,
                roles (nombre_rol)
            `
      )
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error actualizando empleado:', error);

    const msgLower = (error.message || '').toLowerCase();
    let mensajeError = error.message;

    if (msgLower.includes('duplicate key') || msgLower.includes('unique constraint')) {
      mensajeError = 'El nombre de usuario o correo ya está en uso por otro empleado.';
    }

    res.status(500).json({ error: mensajeError });
  }
});

// Obtener perfil propio (datos personales)
router.get('/perfil', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('empleados')
      .select('*, roles (nombre_rol)')
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
      .select('*, roles (nombre_rol)')
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
    const { currentPassword, newPassword } = req.body;
    const email = req.user.email;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'La contraseña actual y la nueva son obligatorias' });
    }

    // 1. Verificar la contraseña actual
    // Creamos un cliente temporal para validar las credenciales actuales del usuario
    const { createClient } = require('@supabase/supabase-js');
    const authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
    }

    // 2. Actualizar a la nueva contraseña usando el cliente admin global
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) throw updateError;

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en cambio de contraseña:', error);
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
      return res
        .status(500)
        .json({ error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor' });
    }

    const { createClient } = require('@supabase/supabase-js');
    const adminSupabase = createClient(process.env.SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await adminSupabase.auth.admin.updateUserById(id, {
      password: password,
    });

    if (error) throw error;

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
