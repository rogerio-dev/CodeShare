const mysql = require('mysql2/promise');

async function createTables() {
    // Configuração do Railway usando variáveis de ambiente
    const config = {
        host: process.env.MYSQLHOST || process.env.DB_SERVER,
        port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT),
        user: process.env.MYSQLUSER || process.env.DB_USER,
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
        database: process.env.MYSQLDATABASE || process.env.DB_DATABASE
    };

    try {
        console.log('🔄 Conectando ao MySQL do Railway...');
        const connection = await mysql.createConnection(config);
        console.log('✅ Conectado ao MySQL do Railway!');

        // SQL para criar as tabelas
        const createSnippetsTable = `
            CREATE TABLE IF NOT EXISTS Snippets (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                Code LONGTEXT NOT NULL,
                UniqueUrl VARCHAR(50) NOT NULL UNIQUE,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_unique_url (UniqueUrl),
                INDEX idx_created_at (CreatedAt)
            )
        `;

        const createStatsTable = `
            CREATE TABLE IF NOT EXISTS AppStatistics (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                TotalCodesShared INT DEFAULT 0,
                LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        const insertInitialStats = `
            INSERT INTO AppStatistics (Id, TotalCodesShared) 
            VALUES (1, 0) 
            ON DUPLICATE KEY UPDATE Id = 1
        `;

        console.log('📋 Criando tabela Snippets...');
        await connection.execute(createSnippetsTable);
        console.log('✅ Tabela Snippets criada!');

        console.log('📊 Criando tabela AppStatistics...');
        await connection.execute(createStatsTable);
        console.log('✅ Tabela AppStatistics criada!');

        console.log('🔢 Inserindo estatísticas iniciais...');
        await connection.execute(insertInitialStats);
        console.log('✅ Estatísticas iniciais inseridas!');

        // Verificar se as tabelas foram criadas
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Tabelas no banco:', tables);

        await connection.end();
        console.log('🎉 Setup do banco concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao configurar banco:', error.message);
        process.exit(1);
    }
}

createTables();
