// index.js - API RESTful CRUD com Express e Airtable
// ATENÇÃO: Os dados de acesso (API Key) estão visíveis no código.
// Isso é INSEGURO. Use o painel 'Secrets' (Cadeado) do Replit para segurança em produção.

// 1. DADOS DE CONEXÃO DO AIRTABLE (MUDE APENAS ESTAS 3 LINHAS)
// ---------------------------------------------------------------------------------------------------
const AIRTABLE_API_KEY = 'patdbpkDXI6SV4dXJ.c516d6464e5a907d6ea227c580e4a14d61e3ac145da6b2b71fe38d29ff00312b';
const AIRTABLE_BASE_ID = 'app2Xa0f6Fni4HZTJ';
const AIRTABLE_TABLE_NAME = 'Tarefas'; // Mantenha 'Tarefas' se não mudou o nome.
// ---------------------------------------------------------------------------------------------------


// 2. IMPORTAÇÃO E CONFIGURAÇÃO BÁSICA
const express = require('express');
const Airtable = require('airtable');

const app = express();
app.use(express.json()); // Middleware para entender JSON nas requisições

// 3. CONEXÃO COM O AIRTABLE (USANDO DADOS HARDCODED)
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const tabelaTarefas = base(AIRTABLE_TABLE_NAME);

const RECURSO = '/tarefas'; 

// Função auxiliar para padronizar o retorno de erro 404
const handleNotFoundError = (res, message) => {
    res.status(404).json({ error: message });
};

// ----------------------------------------------------
// VERBO 1: POST /tarefas (CREATE) - Criar uma nova tarefa
// ----------------------------------------------------
app.post(RECURSO, async (req, res) => {
    try {
        const novoDado = req.body;

        // Cria o registro no Airtable
        const registrosCriados = await tabelaTarefas.create([{ fields: novoDado }]);

        // Retorna o novo registro criado com status 201 (Created)
        res.status(201).json({ 
            id: registrosCriados[0].id,
            ...registrosCriados[0].fields
        });
    } catch (error) {
        console.error("Erro no POST /tarefas:", error.message);
        res.status(400).json({ error: 'Falha ao criar tarefa. Verifique o corpo da requisição.' });
    }
});

// ----------------------------------------------------
// VERBO 2: GET /tarefas (READ ALL) - Listar todas as tarefas
// ----------------------------------------------------
app.get(RECURSO, async (req, res) => {
    try {
        const registros = await tabelaTarefas.select({}).all();

        // Formata os registros para o padrão de API (ID + Campos)
        const listaFormatada = registros.map(record => ({
            id: record.id,
            ...record.fields
        }));

        res.status(200).json(listaFormatada);
    } catch (error) {
        console.error("Erro no GET /tarefas:", error.message);
        res.status(500).json({ error: 'Falha ao listar tarefas.' });
    }
});

// ----------------------------------------------------
// VERBO 3: GET /tarefas/:id (READ ONE) - Buscar tarefa por ID
// ----------------------------------------------------
app.get(`${RECURSO}/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        const registro = await tabelaTarefas.find(id);

        // Retorna o registro com status 200 (OK)
        res.status(200).json({ 
            id: registro.id,
            ...registro.fields
        });
    } catch (error) {
        // Se o erro for de "Record Not Found"
        if (error && error.statusCode === 404) {
             return handleNotFoundError(res, 'Tarefa não encontrada com o ID fornecido.');
        }
        console.error("Erro no GET /tarefas/:id:", error.message);
        res.status(500).json({ error: 'Falha ao buscar tarefa.' });
    }
});

// ----------------------------------------------------
// VERBO 4: PUT /tarefas/:id (UPDATE) - Atualizar tarefa por ID
// ----------------------------------------------------
app.put(`${RECURSO}/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        // Atualiza o registro no Airtable
        const registrosAtualizados = await tabelaTarefas.update([
            { id: id, fields: dadosAtualizados }
        ]);

        // Retorna o registro atualizado com status 200 (OK)
        res.status(200).json({
            id: registrosAtualizados[0].id,
            ...registrosAtualizados[0].fields
        });
    } catch (error) {
        // Se o erro for de "Record Not Found"
        if (error && error.statusCode === 404) {
            return handleNotFoundError(res, 'Tarefa não encontrada para atualização.');
        }
        console.error("Erro no PUT /tarefas/:id:", error.message);
        res.status(400).json({ error: 'Falha ao atualizar tarefa. Verifique o corpo e o ID.' });
    }
});

// ----------------------------------------------------
// VERBO 5: DELETE /tarefas/:id (DELETE) - Remover tarefa por ID
// ----------------------------------------------------
app.delete(`${RECURSO}/:id`, async (req, res) => {
    try {
        const { id } = req.params;

        // Deleta o registro. 
        await tabelaTarefas.destroy([id]); 

        // Status 204 (No Content) é o padrão para deleção bem sucedida
        res.status(204).send(); 
    } catch (error) {
         // Se o erro for de "Record Not Found"
        if (error && error.statusCode === 404) {
            return handleNotFoundError(res, 'Tarefa não encontrada para remoção.');
        }
        console.error("Erro no DELETE /tarefas/:id:", error.message);
        res.status(500).json({ error: 'Falha ao deletar tarefa.' });
    }
});

// ----------------------------------------------------
// 4. INICIAR O SERVIDOR
// ----------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
    console.log("Clique no botão 'Run' (Executar) para ver a URL pública na aba Webview.");
});