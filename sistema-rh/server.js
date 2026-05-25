require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');
const { ensureSeedUser } = require('./data/authRepository');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sistema-rh-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 },
  })
);

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.alert = req.session.alert || null;
  delete req.session.alert;
  next();
});

app.use('/', authRoutes);
app.use('/', webRoutes);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).render('pages/error', {
    title: 'Pagina nao encontrada',
    message: 'A rota solicitada nao existe.',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
  return res.status(500).render('pages/error', {
    title: 'Erro interno',
    message: err.message || 'Nao foi possivel concluir a operacao.',
  });
});

ensureSeedUser()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Sistema RH rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao iniciar o Sistema RH:', err.message);
    process.exit(1);
  });
