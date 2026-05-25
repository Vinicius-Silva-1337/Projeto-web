function requireAuth(req, res, next) {
  if (req.session.usuario) return next();
  req.session.alert = { type: 'warning', message: 'Faca login para continuar.' };
  return res.redirect('/login');
}

function requireApiAuth(req, res, next) {
  if (req.session.usuario) return next();
  return res.status(401).json({ error: 'Nao autenticado' });
}

module.exports = { requireAuth, requireApiAuth };
