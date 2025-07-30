🚀 CodeShare – Sistema de Compartilhamento de Códigos

# 🚀 CodeShare – Sistema de Compartilhamento de Códigos

![GitHub Repo stars](https://img.shields.io/github/stars/rogerio-dev/CodeShare?style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/rogerio-dev/CodeShare?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/rogerio-dev/CodeShare?style=flat-square)
![GitHub license](https://img.shields.io/github/license/rogerio-dev/CodeShare?style=flat-square)
![Node.js](https://img.shields.io/badge/node.js-v16%2B-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=flat-square)


Um sistema simples e eficiente para compartilhar trechos de código com estatísticas em tempo real e expiração automática.
⚙️ Instalação e Configuração
✅ Pré-requisitos

    Node.js v16 ou superior

    SQL Server Express

    npm ou yarn

🛠️ Passo a passo

    Clone o repositório:

git clone https://github.com/rogerio-dev/CodeShare.git
cd CodeShare

    Instale as dependências:

npm install

    Configure as variáveis de ambiente:

cp .env.example .env

    Edite o arquivo .env com suas credenciais:

DB_USER=sa
DB_PASSWORD=SUA_SENHA_DO_SQL_SERVER
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=CodeShare
PORT=3000

    Execute a aplicação:

npm start

📊 Sistema de Estatísticas
📌 Contador Histórico

    Total de Códigos: Total acumulado de códigos compartilhados

    Persistência: Nunca é resetado, mesmo com a limpeza diária

    Local: Tabela AppStatistics no banco de dados

⏳ Códigos Ativos (últimas 24h)

    Remoção automática: Os códigos expiram após 24 horas

    Local: Tabela Snippets no banco de dados

🗄️ Estrutura do Banco de Dados
🧾 Tabela Snippets
Campo	Tipo
Id	INT, IDENTITY
Code	NVARCHAR(MAX)
UniqueUrl	NVARCHAR(50)
CreatedAt	DATETIME2
📈 Tabela AppStatistics
Campo	Tipo
Id	INT, IDENTITY
TotalCodesShared	INT
LastUpdated	DATETIME2
🧹 Limpeza Automática

    Script: cleanup.js

    Função: Remove códigos com mais de 24h sem afetar o contador histórico

    Execução manual:

node cleanup.js

Execução agendada (Windows):

    node C:\caminho\para\CodeShare\cleanup.js

📈 API de Estatísticas

Endpoint: GET /api/stats

Resposta:

{
  "totalCodes": 15,
  "activeCodes": 3,
  "uniqueLanguages": 5,
  "mostRecentCode": { ... },
  "timestamp": "2025-07-29T22:15:36.599Z"
}

⚡ Funcionamento

    Compartilhar Código: Incrementa o total e armazena na tabela Snippets

    Exibir Estatísticas: Retorna dados históricos e os códigos ativos atuais

    Limpeza Diária: Remove registros expirados sem afetar o histórico

    Persistência: O total de códigos compartilhados é permanente

📄 Licença

Este projeto está licenciado sob a Licença MIT.
👨‍💻 Desenvolvedor

Rogerio Dev
🔗 GitHub: @rogerio-dev
📁 Projeto: CodeShare
🤝 Contribuições

Contribuições são sempre bem-vindas!

    Reporte bugs

    Sugira melhorias

    Envie pull requests

    Ajude a melhorar a documentação

⭐ Mostre seu apoio

Se você gostou do projeto, deixe uma ⭐ no repositório para apoiar o desenvolvimento!
