# 🚀 CodeShare - Sistema de Compartilhamento de Códigos

![GitHub Repo stars](https://img.shields.io/github/stars/rogerio-dev/CodeShare?style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/rogerio-dev/CodeShare?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/rogerio-dev/CodeShare?style=flat-square)
![GitHub license](https://img.shields.io/github/license/rogerio-dev/CodeShare?style=flat-square)
![Node.js](https://img.shields.io/badge/node.js-v16%2B-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/status-ativo-brightgreen?style=flat-square)

Um sistema simples e eficiente para compartilhar trechos de código com estatísticas em tempo real e expiração automática de 24h.

## ✨ Características

- 🎨 **Interface Moderna**: Tema Dracula profissional e responsivo
- 📝 **Editor Avançado**: Monaco Editor com syntax highlighting para 20+ linguagens
- 📊 **Estatísticas em Tempo Real**: Contador histórico permanente + códigos ativos
- 🔒 **Privacidade**: Links únicos e seguros, sem coleta de dados pessoais
- ⏰ **Auto-limpeza**: Remoção automática após 24 horas
- 📱 **Responsivo**: Funciona perfeitamente em desktop e mobile

## ⚙️ Instalação e Configuração

### ✅ Pré-requisitos

- Node.js v16 ou superior
- SQL Server Express
- npm ou yarn

### 🛠️ Passo a passo

1. **Clone o repositório:**
```bash
git clone https://github.com/rogerio-dev/CodeShare.git
cd CodeShare
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Edite o arquivo `.env` com suas credenciais:**
```env
DB_USER=sa
DB_PASSWORD=SUA_SENHA_DO_SQL_SERVER
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=CodeShare
PORT=3000
```

5. **Execute a aplicação:**
```bash
npm start
```

6. **Acesse:** http://localhost:3000

## 📊 Sistema de Estatísticas

### 📌 Contador Histórico
- **Total de Códigos**: Total acumulado de códigos compartilhados
- **Persistência**: Nunca é resetado, mesmo com a limpeza diária
- **Localização**: Tabela `AppStatistics` no banco de dados

### ⏳ Códigos Ativos (últimas 24h)
- **Remoção automática**: Os códigos expiram após 24 horas
- **Localização**: Tabela `Snippets` no banco de dados

## 🗄️ Estrutura do Banco de Dados

### 🧾 Tabela `Snippets`
| Campo | Tipo |
|-------|------|
| Id | INT, IDENTITY |
| Code | NVARCHAR(MAX) |
| UniqueUrl | NVARCHAR(50) |
| CreatedAt | DATETIME2 |

### 📈 Tabela `AppStatistics`
| Campo | Tipo |
|-------|------|
| Id | INT, IDENTITY |
| TotalCodesShared | INT |
| LastUpdated | DATETIME2 |

## 🧹 Limpeza Automática

- **Script**: `cleanup.js`
- **Função**: Remove códigos com mais de 24h sem afetar o contador histórico
- **Execução manual:**
```bash
node cleanup.js
```
- **Execução agendada (Windows):**
```batch
node C:\caminho\para\CodeShare\cleanup.js
```

## 📈 API de Estatísticas

**Endpoint**: `GET /api/stats`

**Resposta:**
```json
{
  "totalCodes": 15,
  "activeCodes": 3,
  "uniqueLanguages": 5,
  "mostRecentCode": { ... },
  "timestamp": "2025-07-29T22:15:36.599Z"
}
```

## ⚡ Como Funciona

1. **Compartilhar Código**: Incrementa o total e armazena na tabela Snippets
2. **Exibir Estatísticas**: Retorna dados históricos e os códigos ativos atuais
3. **Limpeza Diária**: Remove registros expirados sem afetar o histórico
4. **Persistência**: O total de códigos compartilhados é permanente

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, Monaco Editor
- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQL Server Express
- **Design**: Dracula Theme, Responsive Design
- **Fonte**: JetBrains Mono

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

## 👨‍💻 Desenvolvedor

**Rogerio Dev**
- 🔗 GitHub: [@rogerio-dev](https://github.com/rogerio-dev)
- 📁 Projeto: [CodeShare](https://github.com/rogerio-dev/CodeShare)

## 🤝 Contribuições

Contribuições são sempre bem-vindas!

- 🐛 Reporte bugs
- 💡 Sugira melhorias
- 🔧 Envie pull requests
- 📚 Ajude a melhorar a documentação

## ⭐ Mostre seu apoio

Se você gostou do projeto, deixe uma ⭐ no repositório para apoiar o desenvolvimento!
