export default async function handler(req, res) {
    // Só aceita requisições do tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { email, senha } = req.body;

    // O Token fica escondido nas configurações da Vercel!
    const TOKEN = process.env.BASEROW_TOKEN; 
    const TABLE_ID = "180827";
    const API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true&search=${encodeURIComponent(email)}`;

    try {
        const resposta = await fetch(API_URL, {
            headers: { "Authorization": `Token ${TOKEN}` }
        });
        const dados = await resposta.json();

        if (dados.count === 0) {
            return res.status(401).json({ success: false, message: "E-mail ou senha incorretos." });
        }

        // A validação da senha acontece AQUI no servidor
        const usuario = dados.results.find(row => row.Email === email && row.Senha === senha);

        if (usuario) {
            delete usuario.Senha; // Limpa a senha antes de devolver pro celular
            return res.status(200).json({ success: true, usuario });
        } else {
            return res.status(401).json({ success: false, message: "E-mail ou senha incorretos." });
        }

    } catch (erro) {
        return res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
}
