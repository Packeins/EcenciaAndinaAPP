const supabase = require('../config/supabase');

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

    // 3. Si es válido, guardamos el usuario en 'req' para que la siguiente ruta pueda usarlo
    req.user = user;

    // 4. Continuar hacia la ruta solicitada
    next();
  } catch (err) {
    console.error('Error en middleware de autenticación:', err);
    res.status(500).json({ error: 'Error interno verificando la autenticación.' });
  }
};

module.exports = authMiddleware;
