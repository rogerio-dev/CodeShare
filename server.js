const express = require('express');
const path = require('path');
const { connect, query } = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// SEO Routes
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Sistema de limpeza automática
const scheduleCleanup = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Próxima meia-noite
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    console.log(`🕒 Próxima limpeza automática agendada para: ${midnight.toLocaleString('pt-BR')}`);
    
    setTimeout(async () => {
        await performCleanup();
        // Reagendar para o próximo dia
        setInterval(performCleanup, 24 * 60 * 60 * 1000); // 24 horas
    }, msUntilMidnight);
};

const performCleanup = async () => {
    try {
        console.log('🧹 Iniciando limpeza automática...');
        
        const result = await query('DELETE FROM Snippets WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 24 HOUR)');
        
        console.log(`✅ Limpeza concluída! ${result.affectedRows} registros removidos.`);
        console.log(`🕒 Próxima limpeza: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('pt-BR')}`);
        
    } catch (error) {
        console.error('❌ Erro na limpeza automática:', error);
    }
};

// Inicializar sistema de limpeza
scheduleCleanup();

app.post('/api/share', async (req, res) => {
    const { code } = req.body;
    const urlId = uuidv4().slice(0, 8);

    try {
        await query('INSERT INTO Snippets (Code, UniqueUrl) VALUES (?, ?)', [code, urlId]);
        
        // Incrementar contador histórico
        await query(`
            UPDATE AppStatistics 
            SET TotalCodesShared = TotalCodesShared + 1, 
                LastUpdated = NOW() 
            WHERE Id = 1
        `);
        
        res.json({ url: `/view/${urlId}` });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar snippet.');
    }
});

// API para buscar estatísticas
app.get('/api/stats', async (req, res) => {
    try {
        // Buscar total histórico de códigos compartilhados
        const historicalTotal = await query('SELECT TotalCodesShared FROM AppStatistics WHERE Id = 1');
        const totalCodes = historicalTotal[0]?.TotalCodesShared || 0;
        
        // Buscar códigos ativos (para outras estatísticas)
        const activeCodesResult = await query('SELECT COUNT(*) as total FROM Snippets');
        const activeCodes = activeCodesResult[0].total;
        
        // Buscar códigos por linguagem para contar linguagens únicas
        const languagesResult = await query(`
            SELECT DISTINCT 
                CASE 
                    WHEN LOWER(Code) LIKE '%console.log%' OR LOWER(Code) LIKE '%function%' OR LOWER(Code) LIKE '%const %' OR LOWER(Code) LIKE '%let %' OR LOWER(Code) LIKE '%var %' THEN 'javascript'
                    WHEN LOWER(Code) LIKE '%def %' OR LOWER(Code) LIKE '%import %' OR LOWER(Code) LIKE '%print(%' OR LOWER(Code) LIKE '%if __name__%' THEN 'python'
                    WHEN LOWER(Code) LIKE '%public class%' OR LOWER(Code) LIKE '%system.out.print%' OR LOWER(Code) LIKE '%public static void main%' THEN 'java'
                    WHEN LOWER(Code) LIKE '%using namespace%' OR LOWER(Code) LIKE '%#include%' OR LOWER(Code) LIKE '%std::%' THEN 'cpp'
                    WHEN LOWER(Code) LIKE '%<!doctype%' OR LOWER(Code) LIKE '%<html%' OR LOWER(Code) LIKE '%<body%' THEN 'html'
                    WHEN LOWER(Code) LIKE '%select %' OR LOWER(Code) LIKE '%from %' OR LOWER(Code) LIKE '%where %' OR LOWER(Code) LIKE '%insert %' THEN 'sql'
                    WHEN LOWER(Code) LIKE '%using system%' OR LOWER(Code) LIKE '%console.writeline%' OR LOWER(Code) LIKE '%namespace %' THEN 'csharp'
                    WHEN LOWER(Code) LIKE '%#include <stdio.h>%' OR LOWER(Code) LIKE '%printf(%' OR LOWER(Code) LIKE '%int main(%' THEN 'c'
                    WHEN LOWER(Code) LIKE '%<?php%' OR LOWER(Code) LIKE '%echo %' OR LOWER(Code) LIKE '%$_%' THEN 'php'
                    WHEN LOWER(Code) LIKE '%func %' OR LOWER(Code) LIKE '%package main%' OR LOWER(Code) LIKE '%fmt.print%' THEN 'go'
                    WHEN LOWER(Code) LIKE '%fn %' OR LOWER(Code) LIKE '%println!%' OR LOWER(Code) LIKE '%let mut%' THEN 'rust'
                    WHEN Code LIKE '%{%' AND Code LIKE '%}%' AND Code LIKE '%:%' AND Code LIKE '%"%' THEN 'json'
                    ELSE 'other'
                END as language
            FROM Snippets 
            WHERE Code IS NOT NULL AND Code != ''
        `);
        
        const uniqueLanguages = languagesResult.length;
        
        // Buscar código mais recente
        const recentCodeResult = await query(`
            SELECT UniqueUrl, CreatedAt 
            FROM Snippets 
            ORDER BY CreatedAt DESC 
            LIMIT 1
        `);
        
        const mostRecentCode = recentCodeResult.length > 0 ? recentCodeResult[0] : null;
        
        res.json({
            totalCodes: totalCodes,
            activeCodes: activeCodes,
            uniqueLanguages,
            mostRecentCode,
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).json({ 
            error: 'Erro ao buscar estatísticas',
            totalCodes: 0,
            uniqueLanguages: 0,
            mostRecentCode: null
        });
    }
});

app.get('/view/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query('SELECT Code FROM Snippets WHERE UniqueUrl = ?', [id]);
        
        if (result.length > 0) {
            const code = result[0].Code;
            res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeShare - Visualizar Código</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/editor/editor.main.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
            color: #F0F6FC;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            background: #21262D;
            border-bottom: 1px solid #30363D;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo { font-size: 1.5rem; font-weight: 700; color: #58A6FF; }
        .back-link {
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .back-link:hover { transform: translateY(-2px); }
        .container { flex: 1; padding: 2rem; }
        #editor { height: calc(100vh - 120px); border-radius: 8px; overflow: hidden; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Código Compartilhado</div>
        <a href="/" class="back-link">← Voltar</a>
    </div>
    <div class="container">
        <div id="editor"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js"></script>
    <script>
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            monaco.editor.defineTheme('dracula', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'FF79C6' },
                    { token: 'string', foreground: 'F1FA8C' },
                    { token: 'number', foreground: 'BD93F9' },
                    { token: 'function', foreground: '50FA7B' },
                    { token: 'variable', foreground: 'F8F8F2' }
                ],
                colors: {
                    'editor.background': '#282A36',
                    'editor.foreground': '#F8F8F2',
                    'editorLineNumber.foreground': '#6272A4',
                    'editor.selectionBackground': '#44475A'
                }
            });

            const editor = monaco.editor.create(document.getElementById('editor'), {
                value: ${JSON.stringify(code)},
                language: 'javascript',
                theme: 'dracula',
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'Fira Code, Consolas, monospace',
                automaticLayout: true
            });
        });
    </script>
</body>
</html>
            `);
        } else {
            res.status(404).send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeShare - Código não encontrado</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
            color: #F0F6FC;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .error-container {
            background: #21262D;
            border: 1px solid #30363D;
            border-radius: 16px;
            padding: 3rem;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .error-code {
            font-size: 4rem;
            font-weight: 700;
            background: linear-gradient(135deg, #F85149 0%, #FF7EE3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #F0F6FC;
        }
        p {
            color: #8B949E;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">404</div>
        <h1>Código não encontrado</h1>
        <p>O código que você está procurando não existe ou pode ter expirado.</p>
        <a href="/" class="back-link">
            ← Voltar para o CodeShare
        </a>
    </div>
</body>
</html>
            `);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeShare - Erro do Servidor</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
            color: #F0F6FC;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .error-container {
            background: #21262D;
            border: 1px solid #30363D;
            border-radius: 16px;
            padding: 3rem;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .error-code {
            font-size: 4rem;
            font-weight: 700;
            background: linear-gradient(135deg, #F85149 0%, #FF7EE3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #F0F6FC;
        }
        p {
            color: #8B949E;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">500</div>
        <h1>Erro do servidor</h1>
        <p>Ocorreu um erro interno no servidor. Tente novamente mais tarde.</p>
        <a href="/" class="back-link">
            ← Voltar para o CodeShare
        </a>
    </div>
</body>
</html>
        `);
    }
});

// Rota para limpeza manual (útil para testes e administração)
app.post('/api/cleanup', async (req, res) => {
    try {
        console.log('🧹 Limpeza manual solicitada...');
        
        const result = await query('DELETE FROM Snippets WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 24 HOUR)');
        
        const response = {
            success: true,
            message: 'Limpeza realizada com sucesso',
            deletedRecords: result.affectedRows,
            timestamp: new Date().toISOString()
        };
        
        console.log(`✅ Limpeza manual concluída! ${result.affectedRows} registros removidos.`);
        res.json(response);
        
    } catch (error) {
        console.error('❌ Erro na limpeza manual:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao realizar limpeza',
            message: error.message 
        });
    }
});

// Rota para verificar status do sistema de limpeza
app.get('/api/cleanup/status', async (req, res) => {
    try {
        // Contar registros expirados (mais de 24h)
        const expiredResult = await query('SELECT COUNT(*) as expired FROM Snippets WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 24 HOUR)');
        const expiredCount = expiredResult[0].expired;
        
        // Contar registros ativos (menos de 24h)
        const activeResult = await query('SELECT COUNT(*) as active FROM Snippets WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)');
        const activeCount = activeResult[0].active;
        
        // Próxima limpeza (próxima meia-noite)
        const now = new Date();
        const nextMidnight = new Date();
        nextMidnight.setHours(24, 0, 0, 0);
        
        res.json({
            activeRecords: activeCount,
            expiredRecords: expiredCount,
            nextCleanup: nextMidnight.toISOString(),
            timeUntilNextCleanup: Math.ceil((nextMidnight.getTime() - now.getTime()) / (1000 * 60 * 60)) + ' horas',
            systemStatus: 'operational'
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar status de limpeza:', error);
        res.status(500).json({ 
            error: 'Erro ao verificar status de limpeza',
            message: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 CodeShare MySQL rodando em http://localhost:${PORT}`));
