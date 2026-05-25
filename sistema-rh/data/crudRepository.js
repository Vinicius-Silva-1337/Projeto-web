const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { resources } = require('./schema');

function getResource(name) {
  const resource = resources[name];
  if (!resource) {
    const err = new Error('Recurso nao encontrado');
    err.status = 404;
    throw err;
  }
  return resource;
}

function normalizeValue(field, value) {
  if (field.type === 'checkbox') return value === 'on' || value === true || value === '1' ? 1 : 0;
  if (value === '') return null;
  return value;
}

function valuesFromBody(resource, body, isCreate = false) {
  const values = {};
  for (const field of resource.fields) {
    if (field.createOnly && !isCreate) continue;
    if (field.name === 'senha') continue;
    values[field.name] = normalizeValue(field, body[field.name]);
  }
  return values;
}

async function list(resourceName) {
  const resource = getResource(resourceName);
  const [rows] = await pool.query(
    `SELECT ${resource.select} FROM ${resource.table} ${resource.joins || ''} ORDER BY ${resource.orderBy}`
  );
  return rows;
}

async function findById(resourceName, id) {
  const resource = getResource(resourceName);
  const [rows] = await pool.query(`SELECT * FROM ${resource.table} WHERE ${resource.pk} = ?`, [id]);
  return rows[0] || null;
}

async function create(resourceName, body) {
  const resource = getResource(resourceName);
  const values = valuesFromBody(resource, body, true);

  if (resourceName === 'usuarios') {
    if (!body.senha) throw new Error('Senha obrigatoria para novo usuario.');
    values.senha_hash = await bcrypt.hash(body.senha, 10);
  }

  const fields = Object.keys(values);
  const placeholders = fields.map(() => '?').join(', ');
  const [result] = await pool.query(
    `INSERT INTO ${resource.table} (${fields.join(', ')}) VALUES (${placeholders})`,
    Object.values(values)
  );
  return findById(resourceName, result.insertId);
}

async function update(resourceName, id, body) {
  const resource = getResource(resourceName);
  const values = valuesFromBody(resource, body, false);

  if (resourceName === 'usuarios' && body.senha) {
    values.senha_hash = await bcrypt.hash(body.senha, 10);
  }

  const fields = Object.keys(values);
  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  await pool.query(`UPDATE ${resource.table} SET ${assignments} WHERE ${resource.pk} = ?`, [
    ...Object.values(values),
    id,
  ]);
  return findById(resourceName, id);
}

async function remove(resourceName, id) {
  const resource = getResource(resourceName);
  const [result] = await pool.query(`DELETE FROM ${resource.table} WHERE ${resource.pk} = ?`, [id]);
  return result.affectedRows > 0;
}

async function optionsFor(resourceName) {
  const resource = getResource(resourceName);
  const [rows] = await pool.query(`SELECT ${resource.pk}, ${resource.label} FROM ${resource.table} ORDER BY ${resource.label}`);
  return rows;
}

async function dashboardStats() {
  const [[funcionarios]] = await pool.query('SELECT COUNT(*) AS total FROM tb_funcionarios WHERE situacao <> "demitido"');
  const [[departamentos]] = await pool.query('SELECT COUNT(*) AS total FROM tb_departamentos WHERE ativo = TRUE');
  const [[folhasPendentes]] = await pool.query('SELECT COUNT(*) AS total FROM tb_folha_pagamento WHERE status_pagamento = "pendente"');
  const [[feriasAgendadas]] = await pool.query('SELECT COUNT(*) AS total FROM tb_ferias WHERE status IN ("agendada", "em andamento")');
  const [ultimosFuncionarios] = await pool.query(`
    SELECT f.id_funcionario, f.nome_completo, f.situacao, c.nome_cargo
    FROM tb_funcionarios f
    INNER JOIN tb_cargos c ON c.id_cargo = f.id_cargo
    ORDER BY f.criado_em DESC
    LIMIT 5
  `);

  return {
    funcionarios: funcionarios.total,
    departamentos: departamentos.total,
    folhasPendentes: folhasPendentes.total,
    feriasAgendadas: feriasAgendadas.total,
    ultimosFuncionarios,
  };
}

module.exports = {
  getResource,
  list,
  findById,
  create,
  update,
  remove,
  optionsFor,
  dashboardStats,
};
