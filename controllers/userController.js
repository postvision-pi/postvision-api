import userService from '../services/userService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, birthDate, cpf, gender, phone } = req.body;

        if (!firstName || !lastName || !email || !password || !birthDate || !cpf || !gender || !phone) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

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
        // Erros de validação/negócio conhecidos (e-mail duplicado, CPF inválido, etc.)
        if (err.message.includes('cadastrado') || err.message.includes('inválido')) {
            return res.status(400).json({ error: err.message });
        }

        console.log('Erro ao criar usuário: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

const getOne = async (req, res) => {
    try {
        const email = req.params.email;
        const user = await userService.getOneSafe(email);
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
        if (email != null) {
            const user = await userService.getOne(email);
            if (user != null) {
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
                    }, process.env.JWT_SECRET, { expiresIn: '2d'}, (err, token) => {
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

        // Um usuário só pode alterar o próprio cadastro.
        if (req.userId !== id) {
            return res.status(403).json({ error: 'Você não tem permissão para alterar este usuário.' });
        }

        const { firstName, lastName, email, password, birthDate, cpf, gender, phone } = req.body;
        const updatedUser = await userService.Update(id, { firstName, lastName, email, password, birthDate, cpf, gender, phone });

        res.status(200).json({
            message: 'Usuário atualizado com sucesso!',
            usuario: {
                id_usuario: updatedUser._id,
                nome_usuario: updatedUser.firstName,
                sobrenome_usuario: updatedUser.lastName,
                email_usuario: updatedUser.email,
                data_nascimento_usuario: updatedUser.birthDate,
                cpf_usuario: updatedUser.cpf,
                genero_usuario: updatedUser.gender,
                telefone_usuario: updatedUser.phone,
            }
        });

    } catch (err) {
        if (err.message.includes('cadastrado') || err.message.includes('inválido') || err.message.includes('não encontrado')) {
            return res.status(400).json({ error: err.message });
        }

        console.log('Erro ao atualizar usuário: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Um usuário só pode apagar a própria conta.
        if (req.userId !== id) {
            return res.status(403).json({ error: 'Você não tem permissão para apagar este usuário.' });
        }

        await userService.Delete(id);
        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (err) {
        console.log('Erro ao deletar usuário: ', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}


const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Imagem de perfil não fornecida'
            });
        }

        const userId = req.userId;

        const result = await userService.uploadProfileImage(
            userId,
            req.file
        );

        res.status(200).json({
            message: 'Foto de perfil atualizada com sucesso!',
            profileImage: result.profileImage
        });

    } catch (err) {
        console.log('Erro ao enviar foto de perfil: ', err);

        res.status(500).json({
            error: 'Erro interno no servidor'
        });
    }
};

const getProfileImage = async (req, res) => {
    try {
        const { id } = req.params;

        const image = await userService.getProfileImage(id);

        res.set('Content-Type', image.contentType);
        res.send(image.data);

    } catch (err) {
        console.log('Erro ao buscar foto de perfil: ', err);

        if (err.message === 'Foto de perfil não encontrada') {
            return res.status(404).json({
                error: err.message
            });
        }

        res.status(500).json({
            error: 'Erro interno no servidor'
        });
    }
};

export default {
    createUser,
    loginUser,
    getOne,
    updateUser,
    deleteUser,
    uploadProfileImage,
    getProfileImage
};
