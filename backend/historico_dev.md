# Histórico de Desenvolvimento - Projeto Seus_Momentos

Este documento registra as principais decisões, conversas e evoluções do backend do projeto.

---

## 📅 Sessão 03/03/2026 - Configuração Inicial e Cadastro de Usuários

### 1. Definição da Arquitetura
**Usuário (Lucas):** Solicitou a configuração inicial do projeto com PHP 8.1+, HTML, CSS, JS, Bootstrap e PostgreSQL (Supabase), focando apenas no backend.
**Ação:** Implementada arquitetura MVC profissional com separação em `Controllers`, `Services`, `Config`, `Routes` e `Utils`.

### 2. Configuração do Ambiente
- **Nome do Projeto:** `Seus_Momentos`.
- **Gerenciador de Dependências:** Composer com autoload PSR-4, `vlucas/phpdotenv` e `guzzlehttp/guzzle`.
- **Banco de Dados:** PostgreSQL v18.3.
- **Ponto de Entrada:** `public/index.php` com suporte a CORS e JSON.

### 3. Implementação do Endpoint `/users` (POST)
**Requisitos Atendidos:**
- Validação de campos obrigatórios (`nome`, `email`, `senha`, `confirmarSenha`).
- Validação de formato de e-mail.
- Validação de **senha forte**: Mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial.
- Verificação de duplicidade de e-mail no banco de dados.
- Criptografia de senha com `password_hash()` (bcrypt).
- Geração de token seguro (`32 bytes`) para verificação de e-mail.

### 4. Documentação Técnica
- Criado o arquivo `DOCUMENT.md` detalhando toda a infraestrutura e a estrutura SQL da tabela `users`.

### 5. Estrutura do Banco de Dados
- Criado o arquivo **[BD_assist.sql](file:///c:/Users/Hp440/.gemini/antigravity/scratch/Nova%20pasta/BD_assist.sql)** contendo o script SQL completo para criação da tabela `users`, incluindo índices e triggers de atualização automática.

---

## 📅 Sessão 08/03/2026 - Refinamento e Finalização do Cadastro

### 1. Conclusão da Implementação
**Ação:** Implementado o `UserController.php` e a base `Controller.php`.
- Refinada a regex de senha forte para incluir caracteres especiais `@$!%*?&`.
- Implementada a classe `Response.php` para padronização rigorosa dos retornos da API.
- Adicionado tratamento de erros para dados JSON inválidos ou vazios.

### 2. Correção de Ambiente e Testes
- **Resolução do Composer**: Identificado erro de diretório (rodar dentro da pasta `/backend`) e resolvido erro de trava de arquivo no Windows (`Resource temporarily unavailable`) através da limpeza da pasta `vendor` via PowerShell.
- **Configuração**: Criado o arquivo `.env.example` para facilitar a configuração local do banco de dados.
- **Postman**: Gerada coleção completa (`seus_momentos_postman.json`) para testes imediatos das rotas de cadastro e cenários de erro.

---
*Histórico mantido para referência futura do time de desenvolvimento.*
