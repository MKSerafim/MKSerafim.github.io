export default async function handler(req, res) {
    // Configuração de CORS para permitir requisições seguras do aplicativo
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { email, senha } = req.body;
    const token = process.env.BASEROW_TOKEN;
    const tableId = "180827"; 

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Busca os usuários cadastrados no banco de dados do Baserow
        const respostaBaserow = await fetch(`https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respostaBaserow.ok) {
            return res.status(500).json({ success: false, message: 'Erro na integração com o banco de dados.' });
        }

        const dados = await respostaBaserow.json();
        
        // Localiza o usuário correspondente (Validação sem distinção de maiúsculas/minúsculas)
        const usuarioEncontrado = dados.results.find(u => 
            u.Email && u.Email.toLowerCase().trim() === email.toLowerCase().trim() && 
            u.Senha && String(u.Senha).trim() === String(senha).trim()
        );

        if (usuarioEncontrado) {
            return res.status(200).json({
                success: true,
                usuario: {
                    Nome: usuarioEncontrado.Nome || "Não informado",
                    Email: usuarioEncontrado.Email || email,
                    DRT: usuarioEncontrado.DRT || "Sem DRT",
                    Cargo: usuarioEncontrado.Cargo || "Sem cargo",
                    Foto: usuarioEncontrado.Foto || "",
                    Loja: usuarioEncontrado.Loja || "Sem loja",
                    id: String(usuarioEncontrado.id)
                }
            });
        } else {
            return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro interno no servidor: ' + error.message });
    }
}
