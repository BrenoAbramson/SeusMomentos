-- Script de Criação do Banco de Dados - Seus_Momentos
-- Compatível com PostgreSQL 18.3

-- Habilitar extensões úteis (opcional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
-- Armazena informações de perfil, credenciais e status de verificação.
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacao VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comentários da Tabela
COMMENT ON TABLE users IS 'Armazena os dados cadastrais dos usuários do sistema Seus_Momentos.';
COMMENT ON COLUMN users.senha IS 'Hash da senha gerado via password_hash() do PHP.';
COMMENT ON COLUMN users.token_verificacao IS 'Token de 32 bytes para validação de e-mail.';

-- Trigger para atualizar o campo atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
