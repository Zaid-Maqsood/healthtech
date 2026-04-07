const jwt = require('jsonwebtoken');

/**
 * Middleware: verify JWT from "Authorization: Token <jwt>" header.
 * Attaches decoded payload to req.user on success.
 */
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  // Expect format: "Token <jwt_value>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Token') {
    return res.status(401).json({ error: 'Invalid authorization format. Use: Token <jwt>' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = auth;
