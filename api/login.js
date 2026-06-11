function toggleSenha() {
    const inputSenha = document.getElementById('senha');
    const btnToggle = document.querySelector('.toggle-password');
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        btnToggle.textContent = 'Ocultar';
    } else {
        inputSenha.type = 'password';
        btnToggle.textContent = 'Mostrar';
    }
}

function mostrarAviso(mensagem) {
    const modal = document.getElementById("custom-modal");
    const modalText = document.getElementById("modal-text");
    modalText.textContent = mensagem;
    modal.classList.add("active");
}

function fecharModal() {
    const modal = document.getElementById("custom-modal");
    modal.classList.remove("active");
}

// Funções para a tela de carregamento
function iniciarCarregamento() {
    document.getElementById('loading-screen').classList.add('active');
}

function pararCarregamento() {
    document.getElementById('loading-screen').classList.remove('active');
}

const TOKEN = "x6rXtkpcBaAYlER6MMDo6Lfd0RSS28Ey";
const TABLE_ID = "180827";
const API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true`;

async function fazerLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const termosChecados = document.getElementById('termos').checked;
    const btn = document.getElementById('btnEntrar');

    if (!email || !senha) {
        mostrarAviso("Por favor, preencha o e-mail e a senha.");
        return;
    }

    if (!termosChecados) {
        mostrarAviso("Você precisa aceitar os Termos e Condições para entrar.");
        return;
    }

    // ATIVA A TELA DE CARREGAMENTO LINDA AQUI
    iniciarCarregamento();
    btn.disabled = true; // Impede que a pessoa clique 2 vezes

    try {
        const resposta = await fetch(`${API_URL}&search=${encodeURIComponent(email)}`, {
            headers: {
                "Authorization": `Token ${TOKEN}`
            }
        });

        const dados = await resposta.json();

        if (dados.count === 0) {
            pararCarregamento(); // PARA O CARREGAMENTO
            mostrarAviso("E-mail ou senha incorretos.");
            btn.disabled = false;
            return;
        }

        const usuario = dados.results.find(row => row.Email === email && row.Senha === senha);

        if (usuario) {
            let urlFoto = "";
            if (typeof usuario.Foto === "string") {
                urlFoto = usuario.Foto;
            } else if (Array.isArray(usuario.Foto) && usuario.Foto.length > 0) {
                urlFoto = usuario.Foto[0].url;
            }

            const listaParaKodular = [
                usuario.Nome || "Não informado",
                usuario.Email || email,
                usuario.DRT || "Sem DRT",
                usuario.Cargo || "Sem cargo",
                urlFoto,
                usuario.Loja || "Sem loja",
                usuario.ID || usuario.id
            ];

            const dadosEmTexto = JSON.stringify(listaParaKodular);

            if (window.AppInventor) {
                window.AppInventor.setWebViewString(dadosEmTexto);
                pararCarregamento(); // PARA O CARREGAMENTO
            } else {
                pararCarregamento(); // PARA O CARREGAMENTO
                console.log("Sucesso:", dadosEmTexto);
                mostrarAviso("Login efetuado com sucesso!");
                btn.disabled = false;
            }
        } else {
            pararCarregamento(); // PARA O CARREGAMENTO
            mostrarAviso("E-mail ou senha incorretos.");
            btn.disabled = false;
        }

    } catch (erro) {
        pararCarregamento(); // PARA O CARREGAMENTO EM CASO DE ERRO
        mostrarAviso("Erro de conexão. Verifique sua internet.");
        console.error(erro);
        btn.disabled = false;
    }
}
