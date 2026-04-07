/**
 * Role-based access middleware factories.
 * Each returns a middleware function that checks req.user.role.
 * Must be used AFTER the auth middleware.
 */

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
}

function isDoctor(req, res, next) {
  if (!req.user || req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Doctor role required.' });
  }
  next();
}

function isPatient(req, res, next) {
  if (!req.user || req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Access denied. Patient role required.' });
  }
  next();
}

/**
 * Allow multiple roles. Usage: allowRoles('admin', 'doctor')
 */
function allowRoles(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required roles: ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { isAdmin, isDoctor, isPatient, allowRoles };
