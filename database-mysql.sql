-- Script de criação do banco para MySQL
CREATE DATABASE IF NOT EXISTS CodeShare;
USE CodeShare;

-- Tabela de Snippets
CREATE TABLE IF NOT EXISTS Snippets (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Code LONGTEXT NOT NULL,
    UniqueUrl VARCHAR(50) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_unique_url (UniqueUrl),
    INDEX idx_created_at (CreatedAt)
);

-- Tabela de Estatísticas
CREATE TABLE IF NOT EXISTS AppStatistics (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TotalCodesShared INT DEFAULT 0,
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir registro inicial de estatísticas
INSERT INTO AppStatistics (Id, TotalCodesShared) 
VALUES (1, 0) 
ON DUPLICATE KEY UPDATE Id = 1;
