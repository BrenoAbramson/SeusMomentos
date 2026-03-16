# Guia de Teste Manual - API de Login

Este guia contém os passos para testar manualmente o endpoint de login da ferramenta **SeusMomentos**.

## 🚀 Como Testar

Certifique-se de que o servidor está rodando na porta **8080** via `composer start`.

Você pode usar ferramentas como **Postman**, **Insomnia** ou o próprio terminal com `curl`.

### 0. Cadastro de Novo Usuário (Obrigatório antes do Login)
**Endpoint**: `POST http://127.0.0.1:8080/api/users`
**Payload**:
```json
{
    "nome": "Seu Nome",
    "email": "usuario@exemplo.com",
    "senha": "SenhaForte123!",
    "confirmar_senha": "SenhaForte123!"
}
```
**Regras**:
- A senha deve ter no mínimo 8 caracteres, incluir número, letra maiúscula, minúscula e caractere especial (ex: @, !, %).
- Os campos `senha` e `confirmar_senha` devem ser idênticos.

---

### 1. Sucesso no Login
**Endpoint**: `POST http://127.0.0.1:8080/api/login` (ou `/login`)
**Payload**:
```json
{
    "email": "usuario@exemplo.com",
    "senha": "SenhaForte123!" 
}
```
> Nota: Use um e-mail cadastrado e a senha correta. O sistema deve retornar `status: success` e os dados do usuário.

---

### 2. Erro: E-mail Inválido (Formato)
**Endpoint**: `POST http://127.0.0.1:8080/api/login`
**Payload**:
```json
{
    "email": "email-sem-formato",
    "senha": "qualquer_coisa"
}
```
**Resposta Esperada**: `400 Bad Request` - "Formato de e-mail inválido".

---

### 3. Erro: Campos Vazios
**Endpoint**: `POST http://127.0.0.1:8080/api/login`
**Payload**:
```json
{
    "email": "",
    "senha": ""
}
```
**Resposta Esperada**: `400 Bad Request` - "E-mail e senha são obrigatórios".

---

### 4. Erro: Credenciais Incorretas (Segurança)
Testar com um e-mail que não existe ou uma senha errada.
**Resposta Esperada**: `401 Unauthorized` - "E-mail ou senha incorretos".

---

## 🛠️ Exemplo de comando `curl` (Terminal)

Cole o comando abaixo no seu terminal:

```bash
curl -X POST http://127.0.0.1:8080/api/login \
     -H "Content-Type: application/json" \
     -d '{"email": "teste@teste.com", "senha": "Senha123!"}'
```
