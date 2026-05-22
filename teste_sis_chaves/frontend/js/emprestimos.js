const api =
    "http://localhost:3000/emprestimos";


// ==========================
// LISTAR EMPRÉSTIMOS
// ==========================
async function listar(){

    const resposta =
        await fetch(api);

    const dados =
        await resposta.json();

    const tabela =
        document.getElementById(
            "listaEmprestimos"
        );

    tabela.innerHTML = "";

    dados.forEach(item => {

        tabela.innerHTML += `
        <tr>

        <td>${item.usuario}</td>

        <td>${item.chave_nome}</td>

        <td>

        ${
            item.status === 'ocupada'
            ?
            '<span class="badge bg-danger">Ocupada</span>'
            :
            '<span class="badge bg-success">Devolvida</span>'
        }

        </td>

        <td>

        <button
        class="btn btn-success btn-sm"
        onclick="devolver(${item.id})"
        >

        Devolver

        </button>

        </td>

        </tr>
        `;

    });

}


// ==========================
// CARREGAR USUÁRIOS
// ==========================
async function carregarUsuarios(){

    const resposta =
        await fetch(
            "http://localhost:3000/usuarios"
        );

    const usuarios =
        await resposta.json();

    const select =
        document.getElementById(
            "id_usuario"
        );

    usuarios.forEach(usuario => {

        select.innerHTML += `
        <option value="${usuario.id}">
            ${usuario.nome}
        </option>
        `;

    });

}


// ==========================
// CARREGAR CHAVES
// ==========================
async function carregarChaves(){

    const resposta =
        await fetch(
            "http://localhost:3000/chaves"
        );

    const chaves =
        await resposta.json();

    const select =
        document.getElementById(
            "id_chave"
        );

    chaves.forEach(chave => {

        // MOSTRAR APENAS DISPONÍVEIS
        if(chave.status !== 'ocupada'){

            select.innerHTML += `
            <option value="${chave.id}">
                ${chave.nome}
            </option>
            `;

        }

    });

}


// ==========================
// CADASTRAR EMPRÉSTIMO
// ==========================
document
.getElementById("formEmprestimo")
.addEventListener("submit", async(e)=>{

e.preventDefault();

const emprestimo = {

    id_usuario:
        document.getElementById(
            "id_usuario"
        ).value,

    id_chave:
        document.getElementById(
            "id_chave"
        ).value

};

await fetch(api, {

    method: "POST",

    headers: {
        "Content-Type":"application/json"
    },

    body: JSON.stringify(emprestimo)

});

alert("Chave emprestada!");

window.location.reload();

});


// ==========================
// DEVOLVER
// ==========================
async function devolver(id){

    await fetch(
        `http://localhost:3000/devolver/${id}`,
        {
            method: "PUT"
        }
    );

    listar();

}


// ==========================
// INICIAR
// ==========================
listar();

carregarUsuarios();

carregarChaves();