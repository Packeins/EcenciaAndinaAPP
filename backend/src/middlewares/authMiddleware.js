/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Responsabilidad: 
 * 1. Validar el token JWT enviado en la cabecera Authorization (Bearer).
 * 2. Verificar la identidad del usuario con Supabase Auth.
 * 3. Comprobar si el usuario está activo mediante metadatos.
 * 4. Adjuntar la información del usuario al objeto 'req' para las siguientes rutas.
 */
const { supabase } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener el token de la cabecera "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No Autorizado. Falta el Token.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Pedirle a Supabase que valide el token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    // 3. Obtener el rol y estado desde los metadatos (evita saturar la DB)
    // El rol se guarda en user_metadata durante el login o creación
    const role = user.app_metadata?.rol || user.user_metadata?.rol || 'caja';
    const isActive = user.user_metadata?.esta_activo !== false;

    if (!isActive) {
      return res.status(403).json({ error: 'Su cuenta ha sido desactivada.' });
    }

    // Adjuntar datos al request
    req.user = {
      ...user,
      rol: role
    };

    // 4. Continuar hacia la ruta solicitada
    next();
  } catch (err) {
    console.error('Error en middleware de autenticación:', err);
    res.status(500).json({ error: 'Error interno verificando la autenticación.' });
  }
};

module.exports = authMiddleware;
