const express = require('express'); 
const bodyParser = require('body-parser'); 
const session = require('express-session'); 
const path = require('path'); 
 
const conexao = require('./db'); 
 
const app = express(); 
 
 
// BODY PARSER 
app.use(bodyParser.urlencoded({ extended: false })); 
 
 
// ARQUIVOS ESTÁTICOS 
app.use(express.static('public')); 
 
 
// SESSÃO 
app.use(session({ 
    secret: 'segredo', 
    resave: false, 
    saveUninitialized: false 
})); 
 
 
 
// ROTA LOGIN 
app.get('/', (req, res) => { 
 
    res.sendFile(path.join(__dirname, 'views/login.html')); 
 
}); 
 
 
 
// PROCESSAR LOGIN 
app.post('/login', (req, res) => { 
 
    const { email, senha } = req.body; 
 
    const sql = ` 
        SELECT * FROM usuarios 
        WHERE email = ? AND senha = ? 
    `; 
 
    conexao.query(sql, [email, senha], (erro, resultado) => { 
 
        if (erro) { 
 
            console.log(erro); 
 
            return res.send('Erro no servidor'); 
 
        } 
 
        // LOGIN CORRETO 
        if (resultado.length > 0) { 
 
            req.session.usuario = resultado[0]; 
 
            res.redirect('/home'); 
 
        } 
 
        // LOGIN INCORRETO 
        else { 
 
            res.send(` 
                <h1>Login inválido!</h1> 
 
                <a href="/">Voltar</a> 
            `); 
 
        } 
 
    }); 
 
}); 
 
 
 
// HOME PROTEGIDA 
app.get('/home', (req, res) => { 
 
    if (!req.session.usuario) { 
 
        return res.redirect('/'); 
 
    } 
 
    res.sendFile(path.join(__dirname, 'views/home.html')); 
 
}); 
 
 
 
// LOGOUT 
app.get('/logout', (req, res) => { 
 
    req.session.destroy(); 
 
    res.redirect('/'); 
 
}); 
// SERVIDOR 
app.listen(3000, () => { 
console.log('Servidor rodando em http://localhost:3000'); 
}); 