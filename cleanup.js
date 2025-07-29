const { connect } = require('./db');

async function cleanupOldSnippets() {
    try {
        console.log('🧹 Iniciando limpeza automática de códigos antigos...');
        
        const sql = await connect();
        
        // Buscar quantos códigos serão removidos (mais de 24 horas)
        const countResult = await sql.query`
            SELECT COUNT(*) as count 
            FROM Snippets 
            WHERE CreatedAt <= DATEADD(hour, -24, GETDATE())
        `;
        
        const toRemoveCount = countResult.recordset[0].count;
        
        if (toRemoveCount > 0) {
            // Remover códigos antigos (mais de 24 horas)
            await sql.query`
                DELETE FROM Snippets 
                WHERE CreatedAt <= DATEADD(hour, -24, GETDATE())
            `;
            
            console.log(`✅ ${toRemoveCount} códigos antigos removidos (>24h)`);
        } else {
            console.log('ℹ️ Nenhum código antigo encontrado para remoção');
        }
        
        // Mostrar estatísticas atuais
        const statsResult = await sql.query`
            SELECT 
                (SELECT COUNT(*) FROM Snippets) as activeCodes,
                (SELECT TotalCodesShared FROM AppStatistics WHERE Id = 1) as totalShared
        `;
        
        const stats = statsResult.recordset[0];
        console.log(`📊 Estatísticas: ${stats.activeCodes} códigos ativos, ${stats.totalShared} total histórico`);
        
    } catch (error) {
        console.error('❌ Erro na limpeza automática:', error);
    }
}

// Executar limpeza se chamado diretamente
if (require.main === module) {
    cleanupOldSnippets().then(() => {
        console.log('🏁 Limpeza concluída');
        process.exit(0);
    });
}

module.exports = { cleanupOldSnippets };
