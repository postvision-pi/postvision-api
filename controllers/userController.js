import userService from '../services/userService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv/config';
const secret = process.env.JWT_SECRET;

const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, birthDate, cpf, gender, phone } = req.body;
        
        // Passamos o body inteiro para o service processar
        const user = await userService.createUser(
            firstName, 
            lastName,
            email,
            password,
            birthDate,
            cpf,
            gender,
            phone
        );

        // Resposta de sucesso (seguindo o padrão do seu route antigo)
        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            usuario: {
                id_usuario: user._id,
                nome_usuario: user.firstName,
                sobrenome_usuario: user.lastName,
                email_usuario: user.email,
                data_nascimento_usuario: user.birthDate,
                cpf_usuario: user.cpf,
                genero_usuario: user.gender,
                telefone_usuario: user.phone,
            }
        });
    } catch (err) {
        // Se for um erro de validação que nós lançamos no Service
        if (err.message.includes("cadastrado")) {
            return res.status(400).json({ error: err.message });
        }

        console.log('Erro ao criar usuário: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

const getOne = async (req, res) => {
    try {
        const email = req.params.email;
        const user = await userService.getOne(email);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (err) {
        console.log('Erro ao buscar usuário: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email != undefined) {
            const user = await userService.getOne(email);
            if (user != undefined) {
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (isPasswordValid) {
                    // Dados que queremos incluir no token
                    jwt.sign({
                        id_usuario: user._id,
                        nome_usuario: user.firstName,
                        sobrenome_usuario: user.lastName,
                        email_usuario: user.email,
                        data_nascimento_usuario: user.birthDate,
                        cpf_usuario: user.cpf,
                        genero_usuario: user.gender,
                        telefone_usuario: user.phone,
                    }, secret, { expiresIn: '2d'}, (err, token) => {
                        if (err) {
                            console.log('Erro ao gerar token: ', err);
                            res.status(500).json({ error: 'Erro ao gerar token' });
                        } else {
                            res.status(200).json({ token : token, message: 'Login realizado com sucesso!' });
                        }
                    })
                } else {
                    res.status(400).json({ error: 'E-mail ou senha inválidos' });
                }
            } else {
                res.status(400).json({ error: 'E-mail ou senha inválidos' });
            }
        } else {
            res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        }

    } catch (err) {
        console.log('Erro ao fazer login: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}


const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, password, birthDate, cpf, gender, phone } = req.body;
        await userService.Update(id, firstName, lastName, email, password, birthDate, cpf, gender, phone);
        res.status(200).json({ message: 'Usuário atualizado com sucesso!' });

    } catch (err) {
        console.log('Erro ao atualizar usuário: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.Delete(id);
        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (err) {
        console.log('Erro ao deletar usuário: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

export default { createUser, loginUser, getOne, updateUser, deleteUser };