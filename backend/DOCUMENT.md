# Documentação Técnica - Projeto Seus_Momentos (Backend)

Este documento fornece uma visão detalhada da arquitetura, estrutura e funcionamento do backend do sistema.

## 🚀 Visão Geral
O backend foi construído utilizando **PHP 8.1+**, seguindo o padrão **MVC (Model-View-Controller)** adaptado para uma API JSON. A persistência de dados é feita via **PostgreSQL (v18.3)** através do **Supabase**.

## 🏗️ Arquitetura do Sistema: Camadas de Responsabilidade (MVC Adaptado)

A estrutura do projeto foi desenhada para separar responsabilidades de forma clara e profissional, focando em uma **API JSON**. A separação é feita em 4 camadas principais:

### 📁 Estrutura de Diretórios e Camadas

1. **Camada de Entrada (`public/index.php`)**
   - **Papel**: O "Porteiro" do sistema.
   - **O que faz**: Inicializa as variáveis de ambiente, configura os cabeçalhos de segurança (**CORS**) e repassa a requisição para o roteador.

2. **Camada de Controle (`src/Controllers/`)**
   - **Papel**: Orquestrador da requisição.
   - **O que faz**: Recebe o JSON do front-end, valida campos obrigatórios, chama o serviço correspondente e retorna resposta padronizada.
   - **Benefício**: Controller "magro", focado apenas na coordenação da entrada e saída.

3. **Camada de Serviço (`src/Services/`)**
   - **Papel**: O cérebro da aplicação (Regras de Negócio).
   - **O que faz**: Verifica duplicidade de dados, realiza o **Hash** das senhas e interage com o banco de dados.
   - **Benefício**: Centraliza a inteligência do sistema, facilitando manutenções e testes.

4. **Camada de Configuração e Utilitários (`src/Config/` & `src/Utils/`)**
   - **Papel**: Infraestrutura e Helpers.
   - **O que faz**: Gerencia conexão única (PDO), centraliza validações (e-mail, senha forte) e padroniza respostas JSON.

### 🔄 Fluxo de uma Requisição (Exemplo: Cadastro)
1. `POST /users` chega no `public/index.php`.
2. `public/index.php` envia para `src/Routes/api.php`.
3. `api.php` invoca `UserController::store()`.
4. `UserController` valida os dados e chama `UserService::create()`.
5. `UserService` aplica regras, faz hash e persiste via `Database.php`.
6. `UserController` retorna JSON de sucesso (201 Created).

## 🛠️ Tecnologias e Dependências
- **Linguagem**: PHP 8.1+
- **Gerenciador de Pacotes**: Composer
- **Frameworks/Libs**:
    - `vlucas/phpdotenv`: Gerenciamento de arquivos `.env`.
- **Banco de Dados**: PostgreSQL intermediado pelo **Supabase** (Conexão direta via PDO).

## 🗄️ Estrutura do Banco de Dados (PostgreSQL)
Para o funcionamento correto do sistema, a tabela `users` deve ser criada com a seguinte estrutura:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacao VARCHAR(255),
    reset_token_hash VARCHAR(255),
    reset_token_expires_at TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


## 🔌 Configuração e Instalação

### 1. Pré-requisitos
- PHP 8.1 ou superior.
- Composer instalado.
- Servidor PostgreSQL ou conta no Supabase.

### 2. Instalação
No diretório raiz (`/backend`), execute:
```bash
composer install
```

### 3. Execução
Para iniciar o servidor de desenvolvimento local (sem necessidade de WAMP/XAMPP):
```bash
composer start
```
O servidor estará disponível em `http://127.0.0.1:8080`. O comando está configurado no `composer.json` para ignorar timeouts (`process-timeout: 0`), ideal para desenvolvimento contínuo.

### 4. Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e preencha com as credenciais do seu projeto no Supabase:

1. Acesse o painel do [Supabase](https://supabase.com/).
2. Vá em **Project Settings** > **Database**.
3. Procure por **Connection Info** ou **Connection String**.
4. Use o modo **Transaction** (porta 6543) se estiver em ambientes com muitas conexões, ou a porta padrão 5432.

Exemplo de `.env`:
```ini
APP_ENV=local
APP_DEBUG=true

# Configurações do Supabase (PostgreSQL)
DB_HOST=aws-0-us-west-2.pooler.supabase.com
DB_PORT=6543
DB_DATABASE=postgres
DB_USER=postgres.qppvkbdjswfbszngmzll
DB_PASSWORD=sua_senha_segura
```

## 📡 API Endpoints (Exemplos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/ping` | Teste de conectividade da API. |
| POST | `/api/users` | Cadastro de novo usuário. |
| POST | `/api/login` | Autenticação de usuário e início de sessão. |
| POST | `/auth/reset-password` | Solicitação de link de recuperação (válido por 3 min). |
| GET | `/auth/reset-password/validate` | Valida se o link enviado ainda é válido/não expirou. |
| POST | `/auth/reset-password/update` | Atualização final da senha no banco de dados. |

> [!NOTE]
> Os endpoints também respondem sem o prefixo `/api` (ex: `/login`), mas o padrão recomendado é utilizar o prefixo. Para detalhes de como testar, consulte o arquivo [MANUAL_TEST.md](file:///c:/Users/Hp440/OneDrive/Área de Trabalho/Projeto/SeusMomentos/backend/MANUAL_TEST.md).

### Exemplo de Resposta Padronizada
O sistema utiliza a classe `Src\Utils\Response` para garantir que todas as respostas sigam o mesmo formato:

**Sucesso (200/201):**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Erro (400/500):**
```json
{
  "status": "error",
  "message": "Mensagem detalhada do erro"
}
```

## 🛡️ Segurança e Boas Práticas
- **PDO**: Consultas utilizam Prepared Statements para prevenir SQL Injection.
- **Password Hashing**: Senhas são armazenadas utilizando `password_hash()` com o algoritmo padrão do PHP.
- **PSR-4**: Autoload estruturado seguindo as normas da comunidade.
- **CORS**: Configurado no `public/index.php` para permitir integrações com o front-end.

---
*Documentação gerada automaticamente para o projeto Seus_Momentos.*
