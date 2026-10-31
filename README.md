# PostVision API

API REST para a plataforma PostVision — um sistema de acompanhamento de exercícios com análise de postura e repetições. Desenvolvida com **Node.js**, **Express** e **MongoDB (Mongoose)**.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Configuração e Instalação](#configuração-e-instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Usuários](#usuários)
  - [Exercícios](#exercícios)
  - [Sessões](#sessões)
  - [Notificações](#notificações)
- [Modelos de Dados](#modelos-de-dados)
- [Estatísticas](#estatísticas)
- [Coleção do Insomnia](#coleção-do-insomnia)

---

## Visão Geral

A PostVision API gerencia usuários, exercícios, sessões de treino e notificações. Cada sessão de treino registra repetições corretas e incorretas, precisão média e o caminho para os dados de landmarks de postura — permitindo análise detalhada de desempenho ao longo do tempo.

---

## Tecnologias

- **Node.js** com ES Modules (`"type": "module"`)
- **Express 5**
- **MongoDB** via **Mongoose**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **nodemon** para desenvolvimento
- **CORS** configurável por origem

---

## Configuração e Instalação

Use **Node.js 24 LTS** e **npm 11 ou superior**. O projeto usa npm e `package-lock.json`.

```bash
# Clone o repositório
git clone https://github.com/renanzanettio/postvision-api.git
cd postvision-api

# Instale as dependências
npm ci

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie o servidor (com hot-reload)
npm run dev

# Ou execute sem hot-reload
npm start
```

O servidor sobe em `http://localhost:4000` por padrão, somente após conectar ao MongoDB.
Se faltar `MONGODB_URI` ou `JWT_SECRET`, se a porta for inválida ou se a conexão falhar,
a inicialização termina com código de erro. `Ctrl+C` encerra o servidor e a conexão.

`GET /health` retorna HTTP 200 com `{"status":"ok","database":"connected"}` quando
o banco está conectado; retorna HTTP 503 se a conexão cair. Essa checagem não consulta o serviço de fotos.

`app.js` configura o Express sem abrir porta. `index.js` carrega o `.env`, valida o ambiente e inicia a API.

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

| Variável        | Descrição                                             | Exemplo                                    |
|-----------------|-------------------------------------------------------|--------------------------------------------|
| `MONGODB_URI`   | String de conexão com o MongoDB Atlas                 | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET`    | Segredo para assinar os tokens JWT                    | `minha_chave_secreta_longa`               |
| `PORT`          | Porta em que a API irá rodar                          | `4000`                                     |
| `FRONTEND_URL`  | Origem permitida pelo CORS                            | `http://localhost:3000`                   |

---

## Autenticação

A API utiliza **JWT (JSON Web Token)** com expiração de **2 dias**.

Após fazer login, inclua o token no header de todas as requisições protegidas:

```
Authorization: Bearer <seu_token>
```

O middleware de autenticação extrai o `userId` do token e o disponibiliza em `req.userId`.

Além de exigir o token, a maioria das rotas também checa se **quem está autenticado é o dono do recurso**:
- `PUT /user/:id` e `DELETE /user/:id` só funcionam se o `:id` da URL for igual ao id do token.
- `GET /session/:userId`, `GET /session/stats/:userId`, `GET /notifications/:userId`, `GET /notifications/unread/:userId` e `PUT /notifications/read/all/:userId` só funcionam se o `:userId` da URL for igual ao id do token.
- `PUT /notifications/:id/read` e `DELETE /notifications/:id` verificam se a notificação pertence ao usuário do token antes de alterar/apagar.
- `POST /session/` e `POST /notifications/` não recebem mais `userId` no corpo — o recurso é sempre criado para o dono do token.

> Rotas de criação de exercício, sessão e notificação exigem login (`authMiddleware`). A listagem de exercícios (`GET /exercice`) continua pública, assim como `POST /user`, `POST /auth` e a imagem de perfil (`GET /user/profile/:id`).

---

## Endpoints

### Usuários

| Método | Rota             | Descrição                        | Auth |
|--------|------------------|----------------------------------|------|
| POST   | `/user`          | Cria um novo usuário             | ❌   |
| POST   | `/auth`          | Realiza login e retorna token JWT (10 tentativas / 15 min por IP) | ❌   |
| GET    | `/user/:email`   | Busca um usuário pelo e-mail     | ✅   |
| PUT    | `/user/:id`      | Atualiza dados de um usuário (só o próprio) | ✅   |
| DELETE | `/user/:id`      | Remove um usuário (só o próprio) | ✅   |

---

#### `POST /user` — Criar usuário

**Body (JSON):**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "birthDate": "1995-04-20",
  "cpf": "123.456.789-00",
  "gender": "Masculino",
  "phone": "11999999999"
}
```

> `gender` aceita apenas: `"Masculino"`, `"Feminino"` ou `"Outro"`.
> `cpf` precisa ser um CPF válido (dígitos verificadores conferidos no servidor) e ainda não cadastrado.

**Resposta `201`:**
```json
{
  "message": "Usuário criado com sucesso!",
  "usuario": {
    "id_usuario": "664abc...",
    "nome_usuario": "João",
    "sobrenome_usuario": "Silva",
    "email_usuario": "joao@email.com",
    "data_nascimento_usuario": "1995-04-20",
    "cpf_usuario": "123.456.789-00",
    "genero_usuario": "Masculino",
    "telefone_usuario": "11999999999"
  }
}
```

**Erro `400`** (e-mail/telefone/CPF já cadastrado ou CPF inválido):
```json
{ "error": "O e-mail já está cadastrado! Faça login." }
```
```json
{ "error": "CPF inválido." }
```

---

#### `POST /auth` — Login

**Body (JSON):**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login realizado com sucesso!"
}
```

**Erro `400`:**
```json
{ "error": "E-mail ou senha inválidos" }
```

---

#### `GET /user/:email` — Buscar usuário 🔒

Retorna os dados do usuário com o e-mail informado (sem o hash de senha). Requer `Authorization: Bearer <token>`.

**Resposta `200`:** objeto do usuário (sem `password`)
**Erro `401`:** token ausente/inválido
**Erro `404`:** `{ "error": "Usuário não encontrado" }`

---

#### `PUT /user/:id` — Atualizar usuário 🔒

Requer `Authorization: Bearer <token>`. **O `:id` da URL precisa ser igual ao id do usuário logado** — só é possível atualizar a própria conta.

**Body (JSON):** mesmos campos do `POST /user`, **todos opcionais** — só os campos enviados são alterados (payload parcial). Se `password` for enviado, é re-hasheado antes de salvar; se `cpf`, `email` ou `phone` forem enviados, são validados/checados contra duplicidade em outras contas.

**Resposta `200`:**
```json
{
  "message": "Usuário atualizado com sucesso!",
  "usuario": {
    "id_usuario": "664abc...",
    "nome_usuario": "João",
    "sobrenome_usuario": "Silva",
    "email_usuario": "joao@email.com",
    "data_nascimento_usuario": "1995-04-20",
    "cpf_usuario": "12345678900",
    "genero_usuario": "Masculino",
    "telefone_usuario": "11999999999"
  }
}
```

**Erro `400`** (CPF/e-mail/telefone inválido ou já usado por outra conta):
```json
{ "error": "CPF inválido." }
```

**Erro `403`** (tentando alterar outro usuário):
```json
{ "error": "Você não tem permissão para alterar este usuário." }
```

---

#### `DELETE /user/:id` — Deletar usuário 🔒

Requer `Authorization: Bearer <token>`. **O `:id` da URL precisa ser igual ao id do usuário logado.**

**Resposta `200`:**
```json
{ "message": "Usuário deletado com sucesso!" }
```

**Erro `403`:**
```json
{ "error": "Você não tem permissão para apagar este usuário." }
```

---

### Exercícios

| Método | Rota              | Descrição                     | Auth |
|--------|-------------------|-------------------------------|------|
| POST   | `/exercice`       | Cria um exercício             | ✅   |
| GET    | `/exercice`       | Lista todos os exercícios     | ❌   |
| PUT    | `/exercice/:id`   | Atualiza um exercício         | ✅   |
| DELETE | `/exercice/:id`   | Remove um exercício           | ✅   |

> Requer apenas estar logado (qualquer usuário autenticado pode gerenciar exercícios — não existe ainda um papel de "admin"; considere adicionar um campo `role` ao `User` se quiser restringir isso).

---

#### `POST /exercice` — Criar exercício 🔒

Requer `Authorization: Bearer <token>`.

**Body (JSON):**
```json
{
  "name": "Agachamento",
  "description": "Exercício para membros inferiores",
  "videoUrl": "https://exemplo.com/video.mp4",
  "muscleGroup": "Pernas"
}
```

**Resposta `201`:**
```json
{ "message": "Exercício criado com sucesso!" }
```

---

#### `GET /exercice` — Listar exercícios

**Resposta `200`:** array com todos os exercícios cadastrados.

---

#### `PUT /exercice/:id` — Atualizar exercício 🔒

Requer `Authorization: Bearer <token>`.

**Body (JSON):** mesmos campos do `POST /exercice`.

**Resposta `200`:**
```json
{ "message": "Exercício atualizado com sucesso!" }
```

---

#### `DELETE /exercice/:id` — Deletar exercício 🔒

Requer `Authorization: Bearer <token>`.

**Resposta `200`:**
```json
{ "message": "Exercício deletado com sucesso!" }
```

---

### Sessões

| Método | Rota                        | Descrição                                    | Auth |
|--------|-----------------------------|----------------------------------------------|------|
| POST   | `/session/`                 | Registra uma sessão de treino                | ✅   |
| GET    | `/session/:userId`          | Busca todas as sessões de um usuário         | ✅   |
| GET    | `/session/stats/:userId`    | Retorna estatísticas calculadas do usuário   | ✅   |

> ⚠️ Se algum serviço externo (ex: um app de câmera/análise de postura) cria sessões chamando `POST /session/` sem um login de usuário, essa exigência de token vai quebrar essa integração — nesse caso, o certo é trocar por uma chave de API interna (no mesmo padrão do `FILES_API_KEY` usado para o PostVision Files) em vez de JWT de usuário.

---

#### `POST /session/` — Criar sessão 🔒

Requer `Authorization: Bearer <token>`. A sessão é sempre criada para o usuário dono do token — **não envie mais `userId` no corpo**, ele é ignorado.

**Body (JSON):**
```json
{
  "exerciseId": "664def...",
  "date": "2026-05-07T10:00:00.000Z",
  "durationInSeconds": 300,
  "report": {
    "correctReps": 12,
    "incorrectReps": 3,
    "averageAccuracy": 80,
    "comment": {
      "text": "Boa execução, manter o joelho alinhado."
    }
  },
  "landmarksPath": "/data/landmarks/sessao_001.json"
}
```

**Resposta `201`:**
```json
{ "message": "Sessão criada com sucesso!" }
```

---

#### `GET /session/:userId` — Listar sessões do usuário 🔒

Requer `Authorization: Bearer <token>`. **O `:userId` da URL precisa ser igual ao id do usuário logado.**

**Resposta `200`:** array com todas as sessões do usuário.
**Erro `403`:** `{ "error": "Você não tem permissão para ver essas sessões." }`

---

#### `GET /session/stats/:userId` — Estatísticas do usuário 🔒

Requer `Authorization: Bearer <token>`. **O `:userId` da URL precisa ser igual ao id do usuário logado.** Retorna métricas calculadas a partir de todas as sessões do usuário.

**Resposta `200`:**
```json
{
  "avgDuration": 285,
  "avgAccuracy": 78,
  "streak": 4,
  "weekly": [
    { "date": "2026-05-06T00:00:00.000Z", "corretos": 15, "total": 18 }
  ],
  "monthly": [
    { "date": "2026-05-01", "totalReps": 30 }
  ],
  "lastSession": {
    "date": "2026-05-07",
    "corretos": 12,
    "incorretos": 3,
    "total": 15,
    "accuracy": 80
  }
}
```

| Campo        | Descrição                                              |
|--------------|--------------------------------------------------------|
| `avgDuration`| Duração média das sessões em segundos                  |
| `avgAccuracy`| Precisão média em % entre todas as sessões             |
| `streak`     | Dias consecutivos com ao menos uma sessão registrada   |
| `weekly`     | Repetições corretas e totais dos últimos 7 dias        |
| `monthly`    | Total de repetições corretas agrupadas por dia         |
| `lastSession`| Dados e precisão da última sessão realizada            |

---

### Notificações

| Método | Rota                                  | Descrição                            | Auth |
|--------|---------------------------------------|--------------------------------------|------|
| POST   | `/notifications/`                     | Cria uma notificação                 | ✅   |
| GET    | `/notifications/:userId`              | Busca todas as notificações          | ✅   |
| GET    | `/notifications/unread/:userId`       | Busca notificações não lidas         | ✅   |
| PUT    | `/notifications/:id/read`             | Marca uma notificação como lida      | ✅   |
| PUT    | `/notifications/read/all/:userId`     | Marca todas como lidas               | ✅   |
| DELETE | `/notifications/:id`                  | Remove uma notificação               | ✅   |

> As notificações expiram automaticamente **30 dias** após a criação (TTL index no MongoDB).
> ⚠️ Se um serviço do sistema (cron de lembrete, `streak_warning` automático, etc.) precisa criar notificações para outros usuários sem login, `POST /notifications/` vai precisar de uma chave de API interna em vez de JWT de usuário — hoje essa rota só cria notificações para o próprio dono do token.

---

#### `POST /notifications/` — Criar notificação 🔒

Requer `Authorization: Bearer <token>`. A notificação é sempre criada para o usuário dono do token — **não envie mais `userId` no corpo**, ele é ignorado.

**Body (JSON):**
```json
{
  "type": "reminder",
  "title": "Hora de treinar!",
  "message": "Você não treina há 2 dias. Que tal uma sessão hoje?",
  "data": {}
}
```

> `type` aceita: `"reminder"`, `"streak_warning"`, `"feedback"`, `"achievement"` ou `"system"`.

**Resposta `201`:** objeto da notificação criada.

---

#### `GET /notifications/:userId` — Listar todas as notificações 🔒

Requer `Authorization: Bearer <token>`. **O `:userId` da URL precisa ser igual ao id do usuário logado.**

**Resposta `200`:** array de notificações do usuário, ordenadas pela mais recente.

---

#### `GET /notifications/unread/:userId` — Notificações não lidas 🔒

Requer `Authorization: Bearer <token>`. **O `:userId` da URL precisa ser igual ao id do usuário logado.**

**Resposta `200`:** array com notificações onde `read: false`.

---

#### `PUT /notifications/:id/read` — Marcar uma como lida 🔒

Requer `Authorization: Bearer <token>`. Só marca como lida se a notificação pertencer ao usuário do token.

**Resposta `200`:** objeto da notificação atualizada.
**Erro `403`:** `{ "error": "Você não tem permissão para alterar esta notificação." }`

---

#### `PUT /notifications/read/all/:userId` — Marcar todas como lidas 🔒

Requer `Authorization: Bearer <token>`. **O `:userId` da URL precisa ser igual ao id do usuário logado.**

**Resposta `200`:**
```json
{ "message": "Todas notificações marcadas como lidas" }
```

---

#### `DELETE /notifications/:id` — Deletar notificação 🔒

Requer `Authorization: Bearer <token>`. Só apaga se a notificação pertencer ao usuário do token.

**Resposta `200`:**
```json
{ "message": "Notificação deletada" }
```

---

## Modelos de Dados

### User
```
firstName       String  (obrigatório)
lastName        String  (obrigatório)
email           String  (obrigatório, único)
password        String  (obrigatório, armazenado com hash bcrypt)
birthDate       String  (obrigatório)
cpf             String  (obrigatório, único)
gender          String  (enum: Masculino | Feminino | Outro)
phone           String  (obrigatório)
createdAt/updatedAt     (automático)
```

### Exercice
```
name            String  (obrigatório)
description     String  (obrigatório)
videoUrl        String  (obrigatório)
muscleGroup     String  (obrigatório)
```

### Session
```
userId          ObjectId → User   (obrigatório)
exerciseId      ObjectId → Exercice (obrigatório)
date            Date    (obrigatório)
durationInSeconds Number (obrigatório)
report:
  correctReps   Number  (obrigatório)
  incorrectReps Number  (obrigatório)
  averageAccuracy Number (obrigatório)
  comment.text  String  (opcional)
landmarksPath   String  (obrigatório)
createdAt/updatedAt (automático)
```

### Notification
```
userId          ObjectId → User   (obrigatório, indexado)
type            String  (enum: reminder | streak_warning | feedback | achievement | system)
title           String  (obrigatório)
message         String  (obrigatório)
read            Boolean (padrão: false, indexado)
data            Object  (padrão: {})
createdAt       Date    (padrão: Date.now, TTL: 30 dias)
```

---

## Estatísticas

As estatísticas retornadas em `GET /session/stats/:userId` são calculadas no servidor a partir de todas as sessões do usuário:

- **Streak:** conta quantos dias consecutivos (retroativamente a partir de hoje) possuem ao menos uma sessão registrada.
- **Weekly:** agrega repetições corretas e totais dos últimos 7 dias. Dias sem sessão são omitidos.
- **Monthly:** soma total de repetições corretas agrupadas por dia, em ordem cronológica.
- **Last Session:** retorna data, repetições e precisão da sessão mais recente.
- **Averages:** média de duração (em segundos) e precisão (%) entre todas as sessões.

---

## Coleção do Insomnia

O arquivo [`postvision-api-07-05-2026.yaml`](./postvision-api-07-05-2026.yaml) é uma exportação de coleção do Insomnia (v5) com todas as rotas já configuradas.

**Como usar:**
1. No Insomnia, vá em `Application → Preferences → Data → Import Data` (ou arraste o arquivo pra dentro do Insomnia) e selecione o `.yaml`.
2. Confira o `Base Environment`: `BASE_URL` já aponta pra `http://localhost:4000`, ajuste se sua API rodar em outra porta/URL.
3. Rode a requisição **Login User** (pasta *Users*) com um e-mail/senha válidos.
4. Copie o campo `token` da resposta e cole na variável de ambiente `TOKEN`.
5. Todas as rotas protegidas (marcadas com 🔒 nas seções acima) já vêm com o header `Authorization: Bearer {{ _.TOKEN }}` configurado — elas vão usar automaticamente o token que você colou no passo 4.

> As requisições de sessão/notificação que usam `:userId` na URL (ex: *Get Sessions By User ID*) usam a variável `USER_ID` do ambiente — atualize-a com o `id_usuario` do usuário logado (deve ser o mesmo dono do `TOKEN`, já que as rotas agora checam isso no servidor).
