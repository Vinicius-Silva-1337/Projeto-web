const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_chaves'
});


// ====================================
// CHAVES
// ====================================

// LISTAR
app.get('/chaves', (req, res) => {

    db.query(
        'SELECT * FROM chaves',
        (err, results) => {

            if(err){
                return res.send(err);
            }

            res.json(results);

        }
    );

});


// CADASTRAR
app.post('/chaves', (req, res) => {

    const { nome, setor } = req.body;

    db.query(
        `
        INSERT INTO chaves
        (nome, setor)
        VALUES (?, ?)
        `,
        [nome, setor]
    );

    res.json({
        message: 'Chave cadastrada'
    });

});


// EDITAR
app.put('/chaves/:id', (req, res) => {

    const { id } = req.params;

    const { nome, setor } = req.body;

    db.query(
        `
        UPDATE chaves
        SET nome=?, setor=?
        WHERE id=?
        `,
        [nome, setor, id]
    );

    res.json({
        message: 'Chave atualizada'
    });

});


// DELETAR
app.delete('/chaves/:id', (req, res) => {

    const { id } = req.params;

    db.query(
        'DELETE FROM chaves WHERE id=?',
        [id]
    );

    res.json({
        message: 'Chave removida'
    });

});


// ====================================
// USUÁRIOS
// ====================================

// LISTAR
app.get('/usuarios', (req, res)=>{

    db.query(
        'SELECT * FROM usuarios',
        (err, results)=>{

            if(err){
                return res.send(err);
            }

            res.json(results);

        }
    );

});


// CADASTRAR
app.post('/usuarios', (req, res)=>{

    const { nome, telefone } = req.body;

    db.query(
        `
        INSERT INTO usuarios
        (nome, telefone)
        VALUES (?, ?)
        `,
        [nome, telefone]
    );

    res.json({
        message: 'Usuário cadastrado'
    });

});


// ====================================
// EMPRÉSTIMOS
// ====================================

// LISTAR
app.get('/emprestimos', (req, res)=>{

    db.query(
        `
        SELECT
            emprestimos.id,
            usuarios.nome AS usuario,
            chaves.nome AS chave_nome,
            chaves.setor,
            emprestimos.data_emprestimo,
            emprestimos.data_devolucao,
            emprestimos.status

        FROM emprestimos

        INNER JOIN usuarios
        ON emprestimos.id_usuario = usuarios.id

        INNER JOIN chaves
        ON emprestimos.id_chave = chaves.id
        `,
        (err, results)=>{

            if(err){
                return res.send(err);
            }

            res.json(results);

        }
    );

});

// LOGIN

app.post('/login', (req, res)=>{

    const { email, senha } = req.body;

    db.query(
        `
        SELECT * FROM admins
        WHERE email=? AND senha=?
        `,
        [email, senha],
        (err, results)=>{

            if(err){
                return res.send(err);
            }

            if(results.length > 0){

                res.json({
                    success: true
                });

            }else{

                res.status(401).json({
                    success: false,
                    message: 'Login inválido'
                });

            }

        }
    );

});

// EMPRESTAR
app.post('/emprestimos', (req, res)=>{

    const { id_usuario, id_chave } = req.body;

    db.query(
        `
        INSERT INTO emprestimos
        (
            id_usuario,
            id_chave,
            data_emprestimo,
            status
        )
        VALUES
        (?, ?, NOW(), 'ocupada')
        `,
        [id_usuario, id_chave]
    );

    db.query(
        `
        UPDATE chaves
        SET status='ocupada'
        WHERE id=?
        `,
        [id_chave]
    );

    res.json({
        message: 'Chave emprestada'
    });

});


// DEVOLVER
app.put('/devolver/:id', (req, res)=>{

    const { id } = req.params;

    db.query(
        `
        SELECT * FROM emprestimos
        WHERE id=?
        `,
        [id],
        (err, results)=>{

            const emprestimo = results[0];

            db.query(
                `
                UPDATE emprestimos
                SET
                    status='devolvida',
                    data_devolucao=NOW()
                WHERE id=?
                `,
                [id]
            );

            db.query(
                `
                UPDATE chaves
                SET status='disponivel'
                WHERE id=?
                `,
                [emprestimo.id_chave]
            );

            res.json({
                message: 'Chave devolvida'
            });

        }
    );

});


// ====================================
// DASHBOARD
// ====================================

app.get('/dashboard', (req, res)=>{

    const dashboard = {};

    db.query(
        `
        SELECT COUNT(*) AS total
        FROM chaves
        `,
        (err, chaves)=>{

            dashboard.chaves =
                chaves[0].total;

            db.query(
                `
                SELECT COUNT(*) AS total
                FROM usuarios
                `,
                (err, usuarios)=>{

                    dashboard.usuarios =
                        usuarios[0].total;

                    db.query(
                        `
                        SELECT COUNT(*) AS total
                        FROM chaves
                        WHERE status='ocupada'
                        `,
                        (err, ocupadas)=>{

                            dashboard.ocupadas =
                                ocupadas[0].total;

                            res.json(dashboard);

                        }
                    );

                }
            );

        }
    );

});


// ====================================

app.listen(3000, ()=>{

    console.log(
        'Servidor rodando http://localhost:3000'
    );

});