const express = require("express");

const router = express.Router();

const db = require("../db");

router.get("/", (req, res) => {

    const sql = "SELECT * FROM gastos";

    db.query(sql, (erro, resultados) => {

        if(erro){
            console.log(erro);
        } else {

            res.render("gastos", {
                gastos: resultados
            });

        }

    });

});

router.get("/novo", (req, res) => {

    res.render("novo");

});

router.post("/salvar", (req, res) => {

    const descricao = req.body.descricao;
    const valor = req.body.valor;

    const sql = "INSERT INTO gastos(descricao, valor) VALUES (?, ?)";

    db.query(sql, [descricao, valor], (erro) => {

        if(erro){
            console.log(erro);
        } else {
            res.redirect("/gastos");
        }

    });

});

router.get("/editar/:id", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM gastos WHERE id = ?";

    db.query(sql, [id], (erro, resultados) => {

        if(erro){
            console.log(erro);
        } else {

            res.render("editar", {
                gasto: resultados[0]
            });

        }

    });

});


router.post("/atualizar/:id", (req, res) => {

    const id = req.params.id;

    const descricao = req.body.descricao;
    const valor = req.body.valor;

    const sql = `
        UPDATE gastos
        SET descricao = ?, valor = ?
        WHERE id = ?
    `;

    db.query(sql, [descricao, valor, id], (erro) => {

        if(erro){
            console.log(erro);
        } else {
            res.redirect("/gastos");
        }

    });

});


router.get("/excluir/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM gastos WHERE id = ?";

    db.query(sql, [id], (erro) => {

        if(erro){
            console.log(erro);
        } else {
            res.redirect("/gastos");
        }

    });

});

module.exports = router;