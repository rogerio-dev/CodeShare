const sql = require('mssql');

// Configuração principal (usando porta direta)
const config = {
    user: 'sa',
    password: '#Bella362847',
    server: 'localhost',
    port: 1433,
    database: 'CodeShare',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    connectionTimeout: 60000,
    requestTimeout: 60000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function connect() {
    try {
        console.log('🔄 Conectando ao SQL Server...');
        const pool = await sql.connect(config);
        console.log('✅ Conexão com SQL Server estabelecida com sucesso!');
        return pool;
    } catch (err) {
        console.error('❌ Erro na conexão com o SQL Server:', err.message);
        throw err;
    }
}

// Função para testar a conexão
async function testConnection() {
    try {
        const pool = await connect();
        const result = await pool.request().query('SELECT GETDATE() as CurrentTime');
        console.log('🎉 Teste de conexão bem-sucedido:', result.recordset[0]);
        return true;
    } catch (err) {
        console.error('❌ Teste de conexão falhou:', err.message);
        return false;
    }
}

module.exports = { connect, testConnection };
