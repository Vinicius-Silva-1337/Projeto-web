# Sistema RH

Sistema web com Express, EJS, Bootstrap, API REST, login por sessao e MySQL/MariaDB.

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Crie o banco:

```bash
mysql -u root -p < sql/schema.sql
```

Esse script recria as tabelas do projeto. Se ja houver dados cadastrados em `sistema_rh`, eles serao apagados.

3. Configure o ambiente:

```bash
cp .env.example .env
```

Edite `DB_USER`, `DB_PASSWORD` e demais variaveis se necessario.

4. Inicie:

```bash
npm start
```

Abra `http://localhost:3000`.

## Login inicial

O sistema cria automaticamente um usuario admin se ele ainda nao existir:

- Email: `admin@sistema-rh.local`
- Senha: `admin123`

Esses dados podem ser alterados no `.env` antes da primeira execucao.

## Rotas web

- `/departamentos`
- `/usuarios`
- `/cargos`
- `/funcionarios`
- `/folha`
- `/ferias`
- `/ponto`

## API REST

Todas as rotas da API exigem login na sessao.

- `GET /api/:recurso`
- `GET /api/:recurso/:id`
- `POST /api/:recurso`
- `PUT /api/:recurso/:id`
- `DELETE /api/:recurso/:id`

Recursos disponiveis: `departamentos`, `usuarios`, `cargos`, `funcionarios`, `folha`, `ferias`, `ponto`.
