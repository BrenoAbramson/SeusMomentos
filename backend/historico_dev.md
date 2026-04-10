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

## 📅 Sessão 11/03/2026 - Migração para Supabase e Autenticação

### 1. Migração Definitiva do Banco de Dados
**Ação:** O banco de dados foi migrado de uma instância local para o **Supabase (PostgreSQL Cloud)**.
- **Host**: `aws-0-us-west-2.pooler.supabase.com`
- **Porta**: `6543` (Pooler para prevenção de excesso de conexões).
- **Driver**: Habilitadas as extensões `pgsql` e `pdo_pgsql` no `php.ini` do ambiente WAMP64.

### 2. Implementação do Login e Segurança
- **Endpoint `/login` (POST)**: Criado para validar credenciais.
- **Integração**: Busca de usuário por e-mail no banco e validação de hash de senha via `password_verify()`.
- **Proteção de Dados**: Remoção automática do campo `senha` no retorno JSON para garantir a privacidade.

### 3. Ajustes de Ambiente e Roteamento
- **Versão do PHP**: Atualizado o ambiente WAMP64 para rodar com **PHP 8.1.13**, atendendo às exigências das dependências do Composer.
- **Router Adaptável**: O arquivo `api.php` foi refatorado para detectar e limpar o caminho da URL automaticamente, permitindo que a API funcione perfeitamente mesmo em subdiretórios do servidor local (ex: `/SeusMomentos/backend/public/index.php/users`).

---

## 📅 Sessão 15/03/2026 - Refinamento de Autenticação e Facilitação de Execução

### 1. Melhorias no Endpoint de Login
**Ação:** Refinado o método `login()` no `UserController.php`.
- Adicionada validação de formato de e-mail via `filter_var`.
- Padronização das mensagens de erro: unificadas para "E-mail ou senha incorretos" visando segurança (não revelar quais e-mails estão cadastrados).
- Garantido que o retorno de sucesso não inclua a senha do usuário e siga o padrão `Src\Utils\Response`.

### 2. Ajustes de Roteamento e Compatibilidade
- **Prefixos de API**: Suporte adicionado para endpoints com prefixo `/api/` no arquivo `api.php`.
- **Servidor Embutido**: Configurado o comando `composer start` para rodar o servidor embutido do PHP (`php -S 127.0.0.1:8080 -t public public/index.php`).
- **Resolução de Conflitos**: Alterada a porta padrão para `8080` para evitar conflitos com serviços locais (Apache/WAMP) na porta `80` ou `8000`.

### 3. Documentação de Testes Manuais
- Criado o arquivo `MANUAL_TEST.md` contendo um guia passo a passo, incluindo payloads JSON e comandos `curl` para testar o fluxo de cadastro e login.

---
 
 ## 📅 Sessão 23/03/2026 - Implementação Real de Recuperação de Senha
 
 ### 1. Integração com PHPMailer
 **Ação:** Implementado envio **real** de e-mails para recuperação de senha.
 - **Biblioteca**: Adicionado `phpmailer/phpmailer` via Composer.
 - **Configuração SMTP**: Estruturado para usar o e-mail oficial do suporte (`seusmomentossuporte@gmail.com`) com suporte a variáveis de ambiente (`.env`).
 
 ### 2. Endpoint de Recuperação (`POST /auth/reset-password`)
 - **Token de Segurança**: Geração de tokens de 32 bytes com hash `bcrypt`.
 - **Expiração Rígida**: Token válido por apenas - **Anti-Enumeração**: A API agora retorna sempre uma resposta genérica ("Você receberá um link de recuperação em breve.") para evitar que atacantes descubram quais e-mails possuem conta no sistema.
 - **Fluxo**: Verificação de e-mail -> Geração de Token -> Envio de Link para o front-end.
 
 ### 3. Banco de Dados
 - Criado script de migração: `backend/src/Config/migration_reset_password.sql`.
 
 ---
 
 ## 📅 Sessão 25/03/2026 - Refinamento de UX, Segurança e Git
 
 ### 1. Refinamento da Expiração do Token
 **Ação:** Ajustada a precisão do tempo de vida do link de recuperação.
 - **Lógica Temporal**: O cronômetro de 3 minutos agora inicia exatamente no momento do disparo bem-sucedido do e-mail, garantindo o tempo integral para o usuário.
 - **Expiração Rígida**: O backend invalida o token em exatamente 3 minutos (180 segundos).
 
 ### 2. Estabilidade e Conectividade SMTP
 - **Correção SSL no Windows**: Implementado o workaround `SMTPOptions` (verify_peer = false) no `UserController.php` para contornar a falha de verificação de certificado CA comum em ambientes PHP locais no Windows.
 - **Servidor PHP**: Atualizado `composer.json` com `process-timeout: 0` para evitar que o servidor de desenvolvimento encerre a execução por timeout do Composer.
 
 ### 3. Bloqueio Total de Link Expirado (UX)
 - **Fase de Carregamento**: O frontend agora consulta o novo endpoint `/auth/reset-password/validate` antes de exibir qualquer campo.
 - **Segurança Visual**: Se o link estiver expirado ou for inválido, o formulário de senha permanece oculto e uma tela de erro central de "Link Expirado" é exibida, impedindo qualquer interação com campos desatualizados.
 
 ### 4. Controle de Versão
 - **Git**: Alterações enviadas para o repositório remoto no branch `feature/SEUSM-0015`, consolidando as melhorias de backend e frontend.
 
 ---

## 📅 Sessão 07/04/2026 - Padronização de API e Sistema de Roles

### 1. Reestruturação de Endpoints
**Ação:** Padronização da nomenclatura das rotas para maior clareza e organização.
- **Antes**: `/users` (Cadastro), `/login` (Login).
- **Agora**: `/auth/cadastro`, `/auth/login`, `/auth/reset-password`, etc.
- **Vantagem**: Agrupamento lógico de funcionalidades sob o prefixo `/auth`.

### 2. Implementação do Sistema de Roles (Perfis)
- **Camada de Dados**: Atualizada a tabela `users` com a coluna `role` (padrão `CLIENT`).
- **Camada de Código**: Criado o helper `Src\Utils\UserRole` para gerenciar as constantes `ADMIN` e `CLIENT`.
- **Controllers**: O `UserController` agora retorna o perfil do usuário no login e permite definir o perfil no cadastro (garantindo que novos usuários sejam `CLIENT` por padrão).

### 3. Segurança e Middleware
- **AuthMiddleware**: Criada a estrutura base de Middleware em `src/Utils/AuthMiddleware.php` para futuras validações de token JWT e controle de acesso granular baseado em perfis.

---

## 📅 Sessão 09/04/2026 - Estratégia de Versionamento e Fluxo de Trabalho

### 1. Definição do Modelo de Branching (Git Flow Adaptado)
**Ação:** Estruturação das ramificações do repositório para garantir estabilidade e organização.
- **`Prod` (Main)**: Código em produção, altamente estável.
- **`Staging`**: Ambiente de pré-lançamento para testes finais e homologação.
- **`dev`**: Branch principal de integração para desenvolvimento contínuo.
- **`feature/SEUSM-XXXX`**: Branches temporárias para implementação de novas funcionalidades ou correções específicas.

### 2. Fluxo de Trabalho (Workflow)
1. Desenvolvedores criam branches `feature/` a partir da `dev`.
2. Após conclusão e testes locais, realizam o Merge para `dev`.
3. Periodicamente, o conteúdo de `dev` é promovido para `Staging`.
4. Após validação em `Staging`, o código é mesclado em `Prod` para release oficial.

---

*Histórico mantido para referência futura do time de desenvolvimento.*
