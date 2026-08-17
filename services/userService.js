import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import FormData from 'form-data';
import axios from 'axios';
import dotenv from 'dotenv/config';

class UserService {
    async createUser(firstName, lastName, email, password, birthDate, cpf, gender, phone) {
        // 1. Verificações de existência
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            throw new Error("O e-mail já está cadastrado! Faça login.");
        }

        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            throw new Error("O telefone já está cadastrado! Faça login.");
        }

        const cpfExists = await User.findOne({ cpf });
        if (cpfExists) {
            throw new Error("O CPF já está cadastrado! Faça login.");
        }

        // 2. Limpeza de dados (Remover caracteres não numéricos)
        const cleanCPF = cpf.replace(/\D/g, "");
        const cleanPhone = phone.replace(/\D/g, "");

        // 3. Hash da senha
        const hashPassword = await bcrypt.hash(password, 10);

        // 4. Criação do usuário
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashPassword,
            birthDate,
            cpf: cleanCPF,
            gender,
            phone: cleanPhone
        });

        return await newUser.save();
    }

    async getOne(email) {
        try {
            const user = await User.findOne({ email : email});
            return user;
        } catch (err) {
            console.log('Erro ao buscar usuário: ', err);
            throw new Error('Erro ao buscar usuário');
        }
    }

    

async uploadProfileImage(userId, file) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const form = new FormData();

        form.append('type', 'profile');
        form.append('userId', userId);
        form.append(
            'file',
            file.buffer,
            {
                filename: file.originalname,
                contentType: file.mimetype
            }
        );

        const response = await axios.post(
            `${process.env.FILES_API_URL}/internal/upload`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'X-Internal-API-Key': process.env.FILES_API_KEY
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );


// Salva apenas o caminho lógico da imagem.
// O caminho físico do arquivo fica exclusivamente no PostVision Files.
const profileImage = `/user/profile/${userId}`;

await User.findByIdAndUpdate(userId, {
    profileImage
});

return {
    profileImage
};

    } catch (err) {
        console.log(
            'Erro ao enviar imagem para postvision-files:',
            err.response?.data || err.message
        );

        throw new Error('Erro ao enviar imagem de perfil');
    }
}

async getProfileImage(userId) {
    try {
        // Busca a imagem diretamente no PostVision Files.
        // A API de arquivos retorna os bytes da imagem.
        const response = await axios.get(
            `${process.env.FILES_API_URL}/internal/profile/${userId}`,
            {
                responseType: 'arraybuffer'
            }
        );

        // Retorna os dados da imagem e o tipo MIME
        // para que o controller possa repassar a imagem ao cliente.
        return {
            data: response.data,
            contentType: response.headers['content-type']
        };

    } catch (err) {
        // Se o PostVision Files não encontrou a imagem,
        // transformamos o erro em uma mensagem que o controller entende.
        if (err.response?.status === 404) {
            throw new Error('Foto de perfil não encontrada');
        }

        console.log(
            'Erro ao buscar imagem no postvision-files:',
            err.response?.data || err.message
        );

        throw new Error('Erro ao buscar imagem de perfil');
    }
}

    async Update(id, firstName, lastName, email, password, birthDate, cpf, gender, phone) {
        try {
            await User.findByIdAndUpdate(id, {
                firstName,
                lastName,
                email,
                password,
                birthDate,
                cpf,
                gender,
                phone
            });
            console.log(`Usuário ${id} atualizado com sucesso!`);
        } catch (err) {
            console.log('Erro ao atualizar usuário: ', err);
            throw new Error('Erro ao atualizar usuário');
        }
    }

    async Delete(id) {
        try {
            await User.findByIdAndDelete(id);
            console.log(`Usuário ${id} deletado com sucesso!`);
        } catch (err) {
            console.log('Erro ao deletar usuário: ', err);
            throw new Error('Erro ao deletar usuário');
        }
    }
    
}

export default new UserService();
