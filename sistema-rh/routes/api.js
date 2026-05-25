const express = require('express');
const { requireApiAuth } = require('../middleware/auth');
const repo = require('../data/crudRepository');

const router = express.Router();
router.use(requireApiAuth);

router.get('/:resource', async (req, res, next) => {
  try {
    res.json(await repo.list(req.params.resource));
  } catch (err) {
    next(err);
  }
});

router.get('/:resource/:id', async (req, res, next) => {
  try {
    const row = await repo.findById(req.params.resource, req.params.id);
    if (!row) return res.status(404).json({ error: 'Registro nao encontrado' });
    return res.json(row);
  } catch (err) {
    return next(err);
  }
});

router.post('/:resource', async (req, res, next) => {
  try {
    const row = await repo.create(req.params.resource, req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/:resource/:id', async (req, res, next) => {
  try {
    const row = await repo.update(req.params.resource, req.params.id, req.body);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:resource/:id', async (req, res, next) => {
  try {
    const deleted = await repo.remove(req.params.resource, req.params.id);
    res.status(deleted ? 204 : 404).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
