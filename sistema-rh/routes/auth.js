const express = require('express');
const bcrypt = require('bcrypt');
const { findUserByEmail, markAccess } = require('../data/authRepository');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  return res.render('auth/login', { title: 'Login' });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const user = await findUserByEmail(email);
    const valid = user && (await bcrypt.compare(senha, user.senha_hash));

    if (!valid) {
      req.session.alert = { type: 'danger', message: 'Email ou senha invalidos.' };
      return res.redirect('/login');
    }

    await markAccess(user.id_usuario);
    req.session.usuario = {
      id: user.id_usuario,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    };
    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
