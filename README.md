# 🚀 PasteShare - Sistema de Compartilhamento de Códigos

<div align="center">

## 🌐 **ACESSE A APLICAÇÃO**
### **[www.pasteshare.com.br](https://www.pasteshare.com.br)**

*Sistema de compartilhamento de códigos online - 100% funcional*

**📝 Nota:** *Aplicação renomeada de CodeShare para PasteShare*

---

</div>

![GitHub Repo stars](https://img.shields.io/github/stars/rogerio-dev/CodeShare?style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/rogerio-dev/CodeShare?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/rogerio-dev/CodeShare?style=flat-square)
![GitHub license](https://img.shields.io/github/license/rogerio-dev/CodeShare?style=flat-square)
![Node.js](https://img.shields.io/badge/node.js-v16%2B-brightgreen?style=flat-square)
![MySQL](https://img.shields.io/badge/database-MySQL-blue?style=flat-square)
![Railway](https://img.shields.io/badge/deploy-Railway-purple?style=flat-square)
![Status](https://img.shields.io/badge/status-ativo-brightgreen?style=flat-square)

Um sistema simples e eficiente para compartilhar trechos de código com estatísticas em tempo real e expiração automática de 24h.

## 📝 Sobre a Mudança de Nome

**CodeShare → PasteShare**

O projeto foi **renomeado de CodeShare para PasteShare** para melhor refletir sua funcionalidade principal de compartilhamento rápido de códigos, similar ao conceito de "paste bins". 

- **✅ Aplicação:** PasteShare (nome atual)
- **✅ Domínio:** www.pasteshare.com.br
- **📁 Repositório:** Mantém o nome CodeShare para compatibilidade
- **🗄️ Banco:** Mantém o nome CodeShare para estabilidade

## ✨ Características

- 🎨 **Interface Moderna**: Tema Dracula profissional e responsivo
- 📝 **Editor Avançado**: Monaco Editor com syntax highlighting para 20+ linguagens
- 📊 **Estatísticas em Tempo Real**: Contador histórico permanente + códigos ativos
- 🔒 **Privacidade**: Links únicos e seguros, sem coleta de dados pessoais
- ⏰ **Auto-limpeza**: Remoção automática após 24 horas
- 📱 **Responsivo**: Funciona perfeitamente em desktop e mobile
- ☁️ **Cloud Ready**: Configurado para deploy no Railway com MySQL

## ⚙️ Instalação e Configuração

### ✅ Pré-requisitos

- Node.js v16 ou superior
- MySQL 8.0+ (local) ou conta Railway (cloud)
- npm ou yarn

### 🛠️ Desenvolvimento Local

1. **Clone o repositório:**
```bash
git clone https://github.com/rogerio-dev/CodeShare.git
cd CodeShare
```

> **Nota:** O repositório mantém o nome CodeShare, mas a aplicação foi renomeada para PasteShare.

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o banco de dados:**
   - Execute o script `database.sql` no seu MySQL local
   - Ou use o comando: `mysql -u root -p < database.sql`

4. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

5. **Edite o arquivo `.env` com suas credenciais:**
```env
# Configuração MySQL Local
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=sua_senha_mysql
MYSQLDATABASE=CodeShare

# Configuração do servidor
PORT=3000
```

> **Nota:** O banco de dados mantém o nome CodeShare para compatibilidade.

6. **Execute a aplicação:**
```bash
npm start
```

7. **Acesse:** http://localhost:3000

### ☁️ Deploy no Railway

1. **Instale o Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Faça login no Railway:**
```bash
railway login
```

3. **Crie um novo projeto:**
```bash
railway init
```

4. **Adicione o serviço MySQL:**
```bash
railway add --service mysql
```

5. **Deploy da aplicação:**
```bash
railway up
```

O Railway configurará automaticamente as variáveis de ambiente MySQL (`MYSQLHOST`, `MYSQLPORT`, etc.).

## 📊 Sistema de Estatísticas

### 📌 Contador Histórico
- **Total de Códigos**: Total acumulado de códigos compartilhados
- **Persistência**: Nunca é resetado, mesmo com a limpeza diária
- **Localização**: Tabela `AppStatistics` no banco de dados

### ⏳ Códigos Ativos (últimas 24h)
- **Remoção automática**: Os códigos expiram após 24 horas
- **Localização**: Tabela `Snippets` no banco de dados

## 🗄️ Estrutura do Banco de Dados

O banco de dados é criado automaticamente usando o script `database.sql`. O script já está configurado para MySQL e cria todas as tabelas necessárias.

### 🧾 Tabela `Snippets`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Id | INT AUTO_INCREMENT | Chave primária |
| Code | LONGTEXT | Código compartilhado |
| UniqueUrl | VARCHAR(50) | URL única do snippet |
| CreatedAt | TIMESTAMP | Data/hora de criação |

### 📈 Tabela `AppStatistics`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Id | INT AUTO_INCREMENT | Chave primária |
| TotalCodesShared | INT | Contador total de códigos |
| LastUpdated | TIMESTAMP | Última atualização |

**Índices criados:**
- `idx_unique_url` na coluna UniqueUrl (performance)
- `idx_created_at` na coluna CreatedAt (limpeza automática)

## 🧹 Limpeza Automática

O sistema remove automaticamente códigos com mais de 24 horas através de um job interno, preservando o contador histórico na tabela de estatísticas.

**Funcionalidades:**
- ✅ Remove snippets expirados (>24h)
- ✅ Preserva contador histórico total
- ✅ Execução automática a cada hora
- ✅ Logs de atividade

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
- **Banco de Dados**: MySQL 8.0+
- **Deploy**: Railway Platform
- **Design**: Dracula Theme, Responsive Design
- **Fonte**: JetBrains Mono

## 🌐 Variáveis de Ambiente

### Desenvolvimento Local
```env
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=sua_senha
MYSQLDATABASE=CodeShare
PORT=3000
```

### Produção (Railway)
As variáveis são configuradas automaticamente pelo Railway quando você adiciona o serviço MySQL:
- `MYSQLHOST` - Host do banco MySQL
- `MYSQLPORT` - Porta do banco MySQL  
- `MYSQLUSER` - Usuário do banco MySQL
- `MYSQLPASSWORD` - Senha do banco MySQL
- `MYSQLDATABASE` - Nome do banco MySQL

## 🚀 Recursos de Produção

- ✅ **Alta Disponibilidade**: Deploy no Railway com uptime 99.9%
- ✅ **SSL/HTTPS**: Certificado automático
- ✅ **Domínio Personalizado**: pasteshare.com.br
- ✅ **Backup Automático**: MySQL gerenciado pelo Railway
- ✅ **Monitoramento**: Logs e métricas em tempo real
- ✅ **Escalabilidade**: Auto-scaling baseado em demanda

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
