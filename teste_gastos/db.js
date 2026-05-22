const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sistema_gastos"
});

db.connect((erro) => {

    if(erro){
        console.log("Erro no banco");
    } else {
        console.log("Banco conectado");
    }

});

module.exports = db;