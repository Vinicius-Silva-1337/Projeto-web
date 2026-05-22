const api = "http://localhost:3000/usuarios";

async function listar(){

    const resposta = await fetch(api);

    const dados = await resposta.json();

    const tabela =
        document.getElementById("listaUsuarios");

    tabela.innerHTML = "";

    dados.forEach(usuario => {

        tabela.innerHTML += `
        <tr>

        <td>${usuario.nome}</td>
        <td>${usuario.telefone}</td>

        </tr>
        `;

    });

}

document
.getElementById("formUsuario")
.addEventListener("submit", async(e)=>{

e.preventDefault();

const usuario = {

    nome:
        document.getElementById("nome").value,

    telefone:
        document.getElementById("telefone").value

};

await fetch(api, {

    method: "POST",

    headers: {
        "Content-Type":"application/json"
    },

    body: JSON.stringify(usuario)

});

listar();

});

listar();