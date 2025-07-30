const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração principal usando variáveis de ambiente
const config = {
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

let pool;

async function connect() {
    try {
        if (!pool) {
            console.log('🔄 Conectando ao MySQL...');
            pool = mysql.createPool(config);
            console.log('✅ Pool de conexão MySQL criado com sucesso!');
        }
        return pool;
    } catch (err) {
        console.error('❌ Erro na conexão com o MySQL:', err.message);
        throw err;
    }
}

// Função para testar a conexão
async function testConnection() {
    try {
        const connection = await connect();
        const [rows] = await connection.execute('SELECT NOW() as CurrentTime');
        console.log('🎉 Teste de conexão MySQL bem-sucedido:', rows[0]);
        return true;
    } catch (err) {
        console.error('❌ Teste de conexão MySQL falhou:', err.message);
        return false;
    }
}

// Função para executar queries
async function query(sql, params = []) {
    try {
        const connection = await connect();
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (err) {
        console.error('❌ Erro ao executar query MySQL:', err.message);
        throw err;
    }
}

module.exports = { connect, testConnection, query };
