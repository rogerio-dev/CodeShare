const express = require('express');
const path = require('path');
const { connect } = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/share', async (req, res) => {
    const { code } = req.body;
    const sql = await connect();
    const urlId = uuidv4().slice(0, 8);

    try {
        await sql.query`INSERT INTO Snippets (Code, UniqueUrl) VALUES (${code}, ${urlId})`;
        
        // Incrementar contador histórico
        await sql.query`
            UPDATE AppStatistics 
            SET TotalCodesShared = TotalCodesShared + 1, 
                LastUpdated = GETDATE() 
            WHERE Id = 1
        `;
        
        res.json({ url: `/view/${urlId}` });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar snippet.');
    }
});

// API para buscar estatísticas
app.get('/api/stats', async (req, res) => {
    try {
        const sql = await connect();
        
        // Buscar total histórico de códigos compartilhados
        const historicalTotalResult = await sql.query`SELECT TotalCodesShared FROM AppStatistics WHERE Id = 1`;
        const historicalTotal = historicalTotalResult.recordset[0]?.TotalCodesShared || 0;
        
        // Buscar códigos ativos (para outras estatísticas)
        const activeCodesResult = await sql.query`SELECT COUNT(*) as total FROM Snippets`;
        const activeCodes = activeCodesResult.recordset[0].total;
        
        // Buscar códigos por linguagem para contar linguagens únicas
        const languagesResult = await sql.query`
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
        `;
        
        const uniqueLanguages = languagesResult.recordset.length;
        
        // Buscar código mais recente
        const recentCodeResult = await sql.query`
            SELECT TOP 1 UniqueUrl, CreatedAt 
            FROM Snippets 
            ORDER BY CreatedAt DESC
        `;
        
        const mostRecentCode = recentCodeResult.recordset.length > 0 ? recentCodeResult.recordset[0] : null;
        
        res.json({
            totalCodes: historicalTotal, // Total histórico de códigos compartilhados
            activeCodes: activeCodes, // Códigos atualmente ativos  
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
    const sql = await connect();
    const { id } = req.params;

    try {
        const result = await sql.query`SELECT Code FROM Snippets WHERE UniqueUrl = ${id}`;
        if (result.recordset.length > 0) {
            const code = result.recordset[0].Code;
            res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeShare - Visualizar Código</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js"></script>
    <style>
        /* ====== DRACULA THEME VARIABLES ====== */
        :root {
            --bg-dark: #0D1117;
            --bg-darker: #161B22;
            --bg-panel: #21262D;
            --bg-hover: #30363D;
            --text-primary: #F0F6FC;
            --text-secondary: #8B949E;
            --text-muted: #6E7681;
            --purple: #8B5CF6;
            --purple-light: #A78BFA;
            --purple-dark: #7C3AED;
            --green: #56D364;
            --blue: #58A6FF;
            --orange: #F78166;
            --red: #F85149;
            --yellow: #F9E2AF;
            --pink: #FF7EE3;
            --border: #30363D;
            --shadow: rgba(0, 0, 0, 0.5);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ====== SCROLLBAR STYLING ====== */
        ::-webkit-scrollbar {
            width: 12px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-darker);
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, var(--purple) 0%, var(--purple-dark) 100%);
            border-radius: 6px;
            border: 2px solid var(--bg-darker);
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, var(--purple-light) 0%, var(--purple) 100%);
        }

        /* ====== HEADER SECTION ====== */
        .header {
            background: linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-darker) 100%);
            border-bottom: 1px solid var(--border);
            padding: 2rem 0;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, var(--purple) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, var(--blue) 0%, transparent 50%);
            opacity: 0.1;
            pointer-events: none;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            text-align: center;
            position: relative;
            z-index: 1;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--purple-light) 0%, var(--blue) 50%, var(--pink) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }

        .header p {
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--bg-panel);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            color: var(--text-primary);
            text-decoration: none;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .back-link:hover {
            background: var(--purple);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }

        /* ====== MAIN CONTAINER ====== */
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 3rem 2rem;
        }

        /* ====== CODE VIEWER SECTION ====== */
        .code-viewer {
            background: var(--bg-panel);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2.5rem;
            box-shadow: 0 8px 32px var(--shadow);
            position: relative;
            overflow: hidden;
        }

        .code-viewer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--purple) 0%, var(--blue) 50%, var(--green) 100%);
        }

        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .code-info h2 {
            font-size: 1.75rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .code-info h2::before {
            content: '📄';
            font-size: 1.5rem;
        }

        .code-meta {
            font-size: 0.875rem;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .code-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .action-btn {
            background: var(--bg-hover);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.75rem 1.25rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            font-weight: 500;
        }

        .action-btn:hover {
            background: var(--purple);
            color: white;
            transform: translateY(-2px);
        }

        .action-btn.primary {
            background: linear-gradient(135deg, var(--green) 0%, var(--blue) 100%);
            color: white;
        }

        .action-btn.primary:hover {
            background: linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%);
        }

        /* ====== CODE DISPLAY ====== */
        .code-display {
            background: var(--bg-dark);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }

        .code-display::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, var(--purple) 0%, var(--blue) 50%, var(--green) 100%);
        }

        .code-toolbar {
            background: var(--bg-darker);
            border-bottom: 1px solid var(--border);
            padding: 0.75rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .window-controls {
            display: flex;
            gap: 0.5rem;
        }

        .control {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .control.close { background: var(--red); }
        .control.minimize { background: var(--yellow); }
        .control.maximize { background: var(--green); }

        .code-language-badge {
            background: linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        #monaco-container {
            height: 500px;
        }

        .fallback-code {
            padding: 2rem;
            font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            color: var(--text-primary);
            white-space: pre-wrap;
            word-break: break-word;
            overflow-x: auto;
        }

        /* ====== RESPONSIVE DESIGN ====== */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .container {
                padding: 2rem 1rem;
            }
            
            .code-viewer {
                padding: 1.5rem;
            }
            
            .code-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .code-actions {
                width: 100%;
                justify-content: flex-start;
            }
            
            #monaco-container {
                height: 400px;
            }
        }

        @media (max-width: 480px) {
            .header h1 {
                font-size: 1.75rem;
            }
            
            .code-viewer {
                padding: 1rem;
            }
            
            .fallback-code {
                padding: 1rem;
                font-size: 0.75rem;
            }
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <header class="header">
        <div class="header-content">
            <h1>CodeShare</h1>
            <p>Código compartilhado por um desenvolvedor</p>
            <a href="/" class="back-link">
                ← Voltar para o CodeShare
            </a>
        </div>
    </header>

    <!-- Main Container -->
    <div class="container">
        <section class="code-viewer">
            <div class="code-header">
                <div class="code-info">
                    <h2>Código Compartilhado</h2>
                    <div class="code-meta">
                        📅 Compartilhado • ID: ${id}
                    </div>
                </div>
                <div class="code-actions">
                    <button class="action-btn primary" onclick="copyToClipboard()">
                        📋 Copiar Código
                    </button>
                    <button class="action-btn" onclick="downloadCode()">
                        💾 Baixar
                    </button>
                    <a href="/" class="action-btn">
                        🚀 Compartilhar Seu Código
                    </a>
                </div>
            </div>
            
            <div class="code-display">
                <div class="code-toolbar">
                    <div class="window-controls">
                        <div class="control close"></div>
                        <div class="control minimize"></div>
                        <div class="control maximize"></div>
                    </div>
                    <div class="code-language-badge">
                        Código
                    </div>
                </div>
                <div id="monaco-container"></div>
                <div id="fallback-code" class="fallback-code" style="display: none;">
${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
            </div>
        </section>
    </div>

    <script>
        const codeContent = ${JSON.stringify(code)};
        let editor;

        // Initialize Monaco Editor
        require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }});
        require(['vs/editor/editor.main'], function () {
            // Define Dracula theme
            monaco.editor.defineTheme('dracula', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'FF79C6' },
                    { token: 'string', foreground: 'F1FA8C' },
                    { token: 'number', foreground: 'BD93F9' },
                    { token: 'type', foreground: '8BE9FD' },
                    { token: 'class', foreground: '50FA7B' },
                    { token: 'function', foreground: '50FA7B' },
                    { token: 'variable', foreground: 'F8F8F2' },
                    { token: 'constant', foreground: 'BD93F9' }
                ],
                colors: {
                    'editor.background': '#0D1117',
                    'editor.foreground': '#F8F8F2',
                    'editorLineNumber.foreground': '#6272A4',
                    'editor.selectionBackground': '#44475A',
                    'editor.lineHighlightBackground': '#44475A20'
                }
            });

            try {
                editor = monaco.editor.create(document.getElementById('monaco-container'), {
                    value: codeContent,
                    language: detectLanguage(codeContent),
                    theme: 'dracula',
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                    readOnly: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    lineNumbers: 'on',
                    folding: true,
                    renderWhitespace: 'selection'
                });

                // Update language badge
                const languageBadge = document.querySelector('.code-language-badge');
                languageBadge.textContent = detectLanguage(codeContent).toUpperCase();

            } catch (error) {
                console.error('Erro ao carregar Monaco Editor:', error);
                // Fallback to simple code display
                document.getElementById('monaco-container').style.display = 'none';
                document.getElementById('fallback-code').style.display = 'block';
            }
        });

        // Simple language detection
        function detectLanguage(code) {
            const lower = code.toLowerCase();
            
            if (lower.includes('console.log') || lower.includes('function') || lower.includes('const ') || lower.includes('let ')) {
                return 'javascript';
            } else if (lower.includes('def ') || lower.includes('import ') || lower.includes('print(')) {
                return 'python';
            } else if (lower.includes('public class') || lower.includes('System.out.print')) {
                return 'java';
            } else if (lower.includes('using namespace') || lower.includes('#include')) {
                return 'cpp';
            } else if (lower.includes('<!doctype') || lower.includes('<html')) {
                return 'html';
            } else if (lower.includes('select ') || lower.includes('from ') || lower.includes('where ')) {
                return 'sql';
            } else if (lower.includes('{') && lower.includes('}') && lower.includes(':')) {
                return 'json';
            } else {
                return 'plaintext';
            }
        }

        // Copy to clipboard
        async function copyToClipboard() {
            try {
                await navigator.clipboard.writeText(codeContent);
                showToast('📋 Código copiado para a área de transferência!', 'success');
            } catch (error) {
                console.error('Erro ao copiar:', error);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = codeContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('📋 Código copiado!', 'success');
            }
        }

        // Download code
        function downloadCode() {
            const blob = new Blob([codeContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'codigo-compartilhado-${id}.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('💾 Download iniciado!', 'success');
        }

        // Toast notification
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--green);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                font-weight: 500;
            \`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }

        // Add CSS for toast animations
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
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
    <title>CodeShare - Código Não Encontrado</title>
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
        <p>O código que você está procurando não existe ou foi removido. Verifique se o link está correto.</p>
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

const PORT = 3000;
app.listen(PORT, () => console.log(`🔥 CodeShare rodando em http://localhost:${PORT}`));
