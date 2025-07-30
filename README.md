# CodeShare - Sistema de Compartilhamento de Códigos

## � Instalação e Configuração

### Pré-requisitos
- Node.js v16+
- SQL Server Express
- npm ou yarn

### Configuração
1. Clone o repositório:
```bash
git clone https://github.com/rogerio-dev/CodeShare.git
cd CodeShare
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais:
```env
DB_USER=sa
DB_PASSWORD=SUA_SENHA_DO_SQL_SERVER
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=CodeShare
PORT=3000
```

5. Execute a aplicação:
```bash
npm start
```

## �📊 Sistema de Estatísticas

### Contador Histórico
- **Total de Códigos**: Mantém o número total de códigos que já foram compartilhados na aplicação
- **Persistência**: Este contador NUNCA é resetado, mesmo após a limpeza diária de 24h
- **Localização**: Armazenado na tabela `AppStatistics` no banco de dados

### Códigos Ativos
- **Códigos Ativos**: Mostra apenas os códigos atualmente disponíveis (últimas 24h)
- **Limpeza**: Códigos são automaticamente removidos após 24 horas
- **Localização**: Armazenado na tabela `Snippets` no banco de dados

## 🗄️ Estrutura do Banco de Dados

### Tabela `Snippets`
```sql
- Id (INT, IDENTITY)
- Code (NVARCHAR(MAX))
- UniqueUrl (NVARCHAR(50))
- CreatedAt (DATETIME2)
```

### Tabela `AppStatistics`
```sql
- Id (INT, IDENTITY)
- TotalCodesShared (INT) -- Contador histórico permanente
- LastUpdated (DATETIME2)
```

## 🧹 Limpeza Automática

### Script de Limpeza: `cleanup.js`
- Remove códigos com mais de 24 horas
- Mantém o contador histórico intacto
- Pode ser executado manualmente: `node cleanup.js`
- Recomendado: Agendar execução diária via cron/task scheduler

### Comando para agendamento (Windows Task Scheduler):
```bash
node C:\caminho\para\CodeShare\cleanup.js
```

## 📈 API de Estatísticas

### Endpoint: `GET /api/stats`
```json
{
  "totalCodes": 15,        // Total histórico (nunca diminui)
  "activeCodes": 3,        // Códigos ativos (últimas 24h)
  "uniqueLanguages": 5,    // Linguagens detectadas nos códigos ativos
  "mostRecentCode": {...}, // Último código compartilhado
  "timestamp": "2025-07-29T22:15:36.599Z"
}
```

## ⚡ Funcionamento

1. **Compartilhar Código**: Incrementa contador histórico + adiciona à tabela Snippets
2. **Exibir Estatísticas**: Mostra total histórico permanente + códigos ativos temporários
3. **Limpeza Diária**: Remove códigos antigos mas preserva contador histórico
4. **Persistência**: Total de códigos compartilhados é mantido para sempre

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Desenvolvedor

**Rogerio Dev**
- GitHub: [@rogerio-dev](https://github.com/rogerio-dev)
- Projeto: [CodeShare](https://github.com/rogerio-dev/CodeShare)

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades  
- Enviar pull requests
- Melhorar a documentação

## ⭐ Mostre seu apoio

Se este projeto foi útil para você, considere dar uma ⭐ no repositório!
