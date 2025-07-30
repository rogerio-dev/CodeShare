const { testConnection } = require('./db-mysql');

async function test() {
    console.log('🔄 Testando conexão MySQL...');
    const success = await testConnection();
    
    if (success) {
        console.log('✅ Conexão MySQL funcionando perfeitamente!');
        process.exit(0);
    } else {
        console.log('❌ Falha na conexão MySQL!');
        process.exit(1);
    }
}

test();
