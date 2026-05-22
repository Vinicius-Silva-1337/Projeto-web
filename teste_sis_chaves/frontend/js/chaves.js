const api = "http://localhost:3000/chaves";


// LISTAR
async function listar(){

    const resposta = await fetch(api);

    const dados = await resposta.json();

    const tabela =
        document.getElementById("listaChaves");

    tabela.innerHTML = "";

    dados.forEach(chave => {

        tabela.innerHTML += `
        <tr>

        <td>${chave.nome}</td>

        <td>${chave.setor}</td>

        <td>

            ${
                chave.status === 'disponivel'
                ?
                '<span class="badge bg-success">Disponível</span>'
                :
                '<span class="badge bg-danger">Ocupada</span>'
            }

        </td>

        <td>

        <button
        class="btn btn-warning btn-sm"
        onclick="editar(
            ${chave.id},
            '${chave.nome}',
            '${chave.setor}'
        )"
        >
        Editar
        </button>

        <button
        class="btn btn-danger btn-sm"
        onclick="deletar(${chave.id})"
        >
        Excluir
        </button>

        </td>

        </tr>
        `;

    });

}


// CADASTRAR
document
.getElementById("formChave")
.addEventListener("submit", async(e)=>{

e.preventDefault();

const id =
    document.getElementById("id").value;

const chave = {

    nome:
        document.getElementById("nome").value,

    setor:
        document.getElementById("setor").value

};

if(id){

    await fetch(`${api}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type":"application/json"
        },

        body: JSON.stringify(chave)

    });

}else{

    await fetch(api, {

        method: "POST",

        headers: {
            "Content-Type":"application/json"
        },

        body: JSON.stringify(chave)

    });

}

document.getElementById("formChave").reset();

listar();

});


// EDITAR
function editar(id, nome, setor){

    document.getElementById("id").value = id;

    document.getElementById("nome").value = nome;

    document.getElementById("setor").value = setor;

}


// DELETAR
async function deletar(id){

    const confirmar =
        confirm("Deseja excluir?");

    if(!confirmar){
        return;
    }

    await fetch(`${api}/${id}`, {

        method: "DELETE"

    });

    listar();

}


// INICIAR
listar();