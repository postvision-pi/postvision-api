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

```bash
# Clone o repositório
git clone https://github.com/renanzanettio/postvision-api.git
cd postvision-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie o servidor (com hot-reload)
npm start
```

O servidor sobe em `http://localhost:4000` por padrão.

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

> **Atenção:** atualmente as rotas de exercício, sessão e notificação **não aplicam o middleware de autenticação** por padrão. Adicione `authMiddleware` nas rotas que precisarem de proteção.

---

## Endpoints

### Usuários

| Método | Rota             | Descrição                        | Auth |
|--------|------------------|----------------------------------|------|
| POST   | `/user`          | Cria um novo usuário             | ❌   |
| POST   | `/auth`          | Realiza login e retorna token JWT | ❌   |
| GET    | `/user/:email`   | Busca um usuário pelo e-mail     | ❌   |
| PUT    | `/user/:id`      | Atualiza dados de um usuário     | ❌   |
| DELETE | `/user/:id`      | Remove um usuário                | ❌   |

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

**Erro `400`** (e-mail ou CPF já cadastrado):
```json
{ "error": "E-mail já cadastrado" }
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

#### `GET /user/:email` — Buscar usuário

Retorna os dados do usuário com o e-mail informado.

**Resposta `200`:** objeto do usuário  
**Erro `404`:** `{ "error": "Usuário não encontrado" }`

---

#### `PUT /user/:id` — Atualizar usuário

**Body (JSON):** mesmos campos do `POST /user` (todos opcionais).

**Resposta `200`:**
```json
{ "message": "Usuário atualizado com sucesso!" }
```

---

#### `DELETE /user/:id` — Deletar usuário

**Resposta `200`:**
```json
{ "message": "Usuário deletado com sucesso!" }
```

---

### Exercícios

| Método | Rota              | Descrição                     | Auth |
|--------|-------------------|-------------------------------|------|
| POST   | `/exercice`       | Cria um exercício             | ❌   |
| GET    | `/exercice`       | Lista todos os exercícios     | ❌   |
| PUT    | `/exercice/:id`   | Atualiza um exercício         | ❌   |
| DELETE | `/exercice/:id`   | Remove um exercício           | ❌   |

---

#### `POST /exercice` — Criar exercício

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

#### `PUT /exercice/:id` — Atualizar exercício

**Body (JSON):** mesmos campos do `POST /exercice`.

**Resposta `200`:**
```json
{ "message": "Exercício atualizado com sucesso!" }
```

---

#### `DELETE /exercice/:id` — Deletar exercício

**Resposta `200`:**
```json
{ "message": "Exercício deletado com sucesso!" }
```

---

### Sessões

| Método | Rota                        | Descrição                                    | Auth |
|--------|-----------------------------|----------------------------------------------|------|
| POST   | `/session/`                 | Registra uma sessão de treino                | ❌   |
| GET    | `/session/:userId`          | Busca todas as sessões de um usuário         | ❌   |
| GET    | `/session/stats/:userId`    | Retorna estatísticas calculadas do usuário   | ❌   |

---

#### `POST /session/` — Criar sessão

**Body (JSON):**
```json
{
  "userId": "664abc...",
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

#### `GET /session/:userId` — Listar sessões do usuário

**Resposta `200`:** array com todas as sessões do usuário.

---

#### `GET /session/stats/:userId` — Estatísticas do usuário

Retorna métricas calculadas a partir de todas as sessões do usuário.

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
| POST   | `/notifications/`                     | Cria uma notificação                 | ❌   |
| GET    | `/notifications/:userId`              | Busca todas as notificações          | ❌   |
| GET    | `/notifications/unread/:userId`       | Busca notificações não lidas         | ❌   |
| PUT    | `/notifications/:id/read`             | Marca uma notificação como lida      | ❌   |
| PUT    | `/notifications/read/all/:userId`     | Marca todas como lidas               | ❌   |
| DELETE | `/notifications/:id`                  | Remove uma notificação               | ❌   |

> As notificações expiram automaticamente **30 dias** após a criação (TTL index no MongoDB).

---

#### `POST /notifications/` — Criar notificação

**Body (JSON):**
```json
{
  "userId": "664abc...",
  "type": "reminder",
  "title": "Hora de treinar!",
  "message": "Você não treina há 2 dias. Que tal uma sessão hoje?",
  "data": {}
}
```

> `type` aceita: `"reminder"`, `"streak_warning"`, `"feedback"`, `"achievement"` ou `"system"`.

**Resposta `201`:** objeto da notificação criada.

---

#### `GET /notifications/:userId` — Listar todas as notificações

**Resposta `200`:** array de notificações do usuário, ordenadas pela mais recente.

---

#### `GET /notifications/unread/:userId` — Notificações não lidas

**Resposta `200`:** array com notificações onde `read: false`.

---

#### `PUT /notifications/:id/read` — Marcar uma como lida

**Resposta `200`:** objeto da notificação atualizada.

---

#### `PUT /notifications/read/all/:userId` — Marcar todas como lidas

**Resposta `200`:**
```json
{ "message": "Todas notificações marcadas como lidas" }
```

---

#### `DELETE /notifications/:id` — Deletar notificação

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
