const mysql = require("mysql2")

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"",
    database: "sistema_login"
})

conexao.connect((erro)=>{
    if(erro){
        console.error("Erro ao conectar: ", erro)
    }else{
        console.log("Conexão bem-sucedida!")
    }
})
module.exports = conexao