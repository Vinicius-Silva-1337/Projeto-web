const api =
    "http://localhost:3000/emprestimos";


// ==========================
// LISTAR DEVOLUÇÕES
// ==========================
async function listar(){

    const resposta =
        await fetch(api);

    const dados =
        await resposta.json();

    const tabela =
        document.getElementById(
            "listaDevolucoes"
        );

    tabela.innerHTML = "";

    dados.forEach(item => {

        tabela.innerHTML += `
        <tr>

        <td>${item.usuario}</td>

        <td>${item.chave_nome}</td>

        <td>
            ${
                item.data_emprestimo
                ?
                new Date(
                    item.data_emprestimo
                ).toLocaleString('pt-BR')
                :
                '-'
            }
        </td>

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

        ${
            item.status === 'ocupada'
            ?
            `
            <button
            class="btn btn-success btn-sm"
            onclick="devolver(${item.id})"
            >

            <i class="bi bi-check-circle"></i>

            Devolver

            </button>
            `
            :
            `
            <span class="text-success fw-bold">
            ✔ Entregue
            </span>
            `
        }

        </td>

        </tr>
        `;

    });

}


// ==========================
// DEVOLVER
// ==========================
async function devolver(id){

    const confirmar =
        confirm(
            "Deseja devolver esta chave?"
        );

    if(!confirmar){
        return;
    }

    await fetch(
        `http://localhost:3000/devolver/${id}`,
        {
            method: "PUT"
        }
    );

    alert("Chave devolvida!");

    listar();

}


// ==========================
// INICIAR
// ==========================
listar();