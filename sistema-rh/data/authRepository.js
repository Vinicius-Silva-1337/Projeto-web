const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.*, d.nome AS departamento_nome, f.nome_completo AS funcionario_nome
     FROM tb_usuarios_admin u
     LEFT JOIN tb_departamentos d ON d.id_departamento = u.id_departamento
     LEFT JOIN tb_funcionarios f ON f.id_funcionario = u.id_funcionario
     WHERE u.email = ? AND u.ativo = TRUE
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function markAccess(userId) {
  await pool.query('UPDATE tb_usuarios_admin SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id_usuario = ?', [userId]);
}

async function ensureSeedUser() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@sistema-rh.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const [rows] = await pool.query('SELECT id_usuario FROM tb_usuarios_admin WHERE email = ? LIMIT 1', [email]);
  if (rows.length) return;

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO tb_usuarios_admin (nome, email, senha_hash, perfil, ativo)
     VALUES (?, ?, ?, 'super_admin', TRUE)`,
    ['Administrador', email, hash]
  );
}

module.exports = { findUserByEmail, markAccess, ensureSeedUser };
