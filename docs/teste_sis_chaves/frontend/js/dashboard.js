const api =
    "http://localhost:3000/dashboard";


// ==========================
// DASHBOARD
// ==========================
async function carregarDashboard(){

    const resposta =
        await fetch(api);

    const dados =
        await resposta.json();

    document.getElementById(
        "totalChaves"
    ).innerText = dados.chaves;

    document.getElementById(
        "ocupadas"
    ).innerText = dados.ocupadas;

    document.getElementById(
        "usuarios"
    ).innerText = dados.usuarios;

}


// ==========================
// ÚLTIMOS EMPRÉSTIMOS
// ==========================
async function carregarEmprestimos(){

    const resposta =
        await fetch(
            "http://localhost:3000/emprestimos"
        );

    const dados =
        await resposta.json();

    const tabela =
        document.getElementById(
            "ultimosEmprestimos"
        );

    tabela.innerHTML = "";

    // MOSTRAR SOMENTE 5
    dados.slice(0,5).forEach(item => {

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

        </tr>
        `;

    });

}


// ==========================
// INICIAR
// ==========================
carregarDashboard();

carregarEmprestimos();