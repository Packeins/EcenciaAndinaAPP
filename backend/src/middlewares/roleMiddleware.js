/**
 * MIDDLEWARE DE AUTORIZACIÓN POR ROLES
 * Responsabilidad: 
 * 1. Verificar que el usuario ya esté autenticado (depende de authMiddleware).
 * 2. Comparar el rol del usuario contra una lista de roles permitidos.
 * 3. Bloquear el acceso con un error 403 si el usuario no tiene los permisos suficientes.
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (!req.user.rol || !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. No tienes permisos suficientes para esta acción.' });
    }

    next();
  };
};

module.exports = roleMiddleware;
