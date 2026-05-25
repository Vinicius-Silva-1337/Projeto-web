const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { resources } = require('../data/schema');
const repo = require('../data/crudRepository');

const router = express.Router();
router.use(requireAuth);

async function loadSelects(resource) {
  const selects = {};
  for (const field of resource.fields.filter((item) => item.type === 'select')) {
    selects[field.name] = await repo.optionsFor(field.resource);
  }
  return selects;
}

router.get('/', async (req, res, next) => {
  try {
    const stats = await repo.dashboardStats();
    res.render('pages/dashboard', { title: 'Dashboard', stats, resources });
  } catch (err) {
    next(err);
  }
});

router.get('/:resource', async (req, res, next) => {
  try {
    const resource = repo.getResource(req.params.resource);
    const rows = await repo.list(req.params.resource);
    res.render('pages/list', {
      title: resource.title,
      resourceName: req.params.resource,
      resource,
      rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:resource/novo', async (req, res, next) => {
  try {
    const resource = repo.getResource(req.params.resource);
    res.render('pages/form', {
      title: `Novo - ${resource.title}`,
      resourceName: req.params.resource,
      resource,
      row: {},
      selects: await loadSelects(resource),
      action: `/${req.params.resource}`,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:resource', async (req, res, next) => {
  try {
    await repo.create(req.params.resource, req.body);
    req.session.alert = { type: 'success', message: 'Registro criado com sucesso.' };
    res.redirect(`/${req.params.resource}`);
  } catch (err) {
    req.session.alert = { type: 'danger', message: err.message };
    res.redirect(`/${req.params.resource}/novo`);
  }
});

router.get('/:resource/:id/editar', async (req, res, next) => {
  try {
    const resource = repo.getResource(req.params.resource);
    const row = await repo.findById(req.params.resource, req.params.id);
    if (!row) return res.redirect(`/${req.params.resource}`);
    return res.render('pages/form', {
      title: `Editar - ${resource.title}`,
      resourceName: req.params.resource,
      resource,
      row,
      selects: await loadSelects(resource),
      action: `/${req.params.resource}/${req.params.id}`,
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/:resource/:id', async (req, res) => {
  try {
    await repo.update(req.params.resource, req.params.id, req.body);
    req.session.alert = { type: 'success', message: 'Registro atualizado com sucesso.' };
  } catch (err) {
    req.session.alert = { type: 'danger', message: err.message };
  }
  res.redirect(`/${req.params.resource}`);
});

router.post('/:resource/:id/excluir', async (req, res) => {
  try {
    await repo.remove(req.params.resource, req.params.id);
    req.session.alert = { type: 'success', message: 'Registro removido com sucesso.' };
  } catch (err) {
    req.session.alert = { type: 'danger', message: `Nao foi possivel excluir: ${err.message}` };
  }
  res.redirect(`/${req.params.resource}`);
});

module.exports = router;
