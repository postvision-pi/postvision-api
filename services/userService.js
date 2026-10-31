import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import FormData from 'form-data';
import axios from 'axios';
import dotenv from 'dotenv/config';
import { isValidCPF, onlyDigits } from '../utils/cpfValidator.js';

class UserService {
    async createUser(firstName, lastName, email, password, birthDate, cpf, gender, phone) {
        // 1. Validação do CPF (dígitos verificadores)
        if (!isValidCPF(cpf)) {
            throw new Error('CPF inválido.');
        }

        const cleanCPF = onlyDigits(cpf);
        const cleanPhone = onlyDigits(phone);

        // 2. Verificações de existência
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            throw new Error("O e-mail já está cadastrado! Faça login.");
        }

        const phoneExists = await User.findOne({ phone: cleanPhone });
        if (phoneExists) {
            throw new Error("O telefone já está cadastrado! Faça login.");
        }

        const cpfExists = await User.findOne({ cpf: cleanCPF });
        if (cpfExists) {
            throw new Error("O CPF já está cadastrado! Faça login.");
        }

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
            const user = await User.findOne({ email: email });
            return user;
        } catch (err) {
            console.log('Erro ao buscar usuário: ', err);
            throw new Error('Erro ao buscar usuário');
        }
    }

    /**
     * Busca um usuário sem o campo de senha (hash), seguro para
     * ser devolvido ao cliente.
     */
    async getOneSafe(email) {
        try {
            const user = await User.findOne({ email }).select('-password');
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

    /**
     * Atualiza um usuário de forma parcial: só altera os campos que
     * realmente vieram no corpo da requisição (o front do PostVision
     * manda payloads parciais — ex: só {phone, email} na seção de
     * segurança, ou só {firstName, lastName, cpf, gender, birthDate}
     * na seção pessoal). Campos não enviados nunca são tocados.
     */
    async Update(id, { firstName, lastName, email, password, birthDate, cpf, gender, phone }) {
        try {
            const updateFields = {};

            if (firstName !== undefined) updateFields.firstName = firstName;
            if (lastName !== undefined) updateFields.lastName = lastName;
            if (gender !== undefined) updateFields.gender = gender;
            if (birthDate !== undefined) updateFields.birthDate = birthDate;

            if (cpf !== undefined) {
                if (!isValidCPF(cpf)) {
                    throw new Error('CPF inválido.');
                }
                const cleanCPF = onlyDigits(cpf);

                const cpfExists = await User.findOne({ cpf: cleanCPF, _id: { $ne: id } });
                if (cpfExists) {
                    throw new Error('O CPF já está cadastrado em outra conta.');
                }
                updateFields.cpf = cleanCPF;
            }

            if (phone !== undefined) {
                const cleanPhone = onlyDigits(phone);

                const phoneExists = await User.findOne({ phone: cleanPhone, _id: { $ne: id } });
                if (phoneExists) {
                    throw new Error('O telefone já está cadastrado em outra conta.');
                }
                updateFields.phone = cleanPhone;
            }

            if (email !== undefined) {
                const emailExists = await User.findOne({ email, _id: { $ne: id } });
                if (emailExists) {
                    throw new Error('O e-mail já está cadastrado em outra conta.');
                }
                updateFields.email = email;
            }

            // A senha só é alterada se vier preenchida no payload, e
            // sempre passa por hash — nunca é salva em texto puro.
            if (password !== undefined && password !== '') {
                updateFields.password = await bcrypt.hash(password, 10);
            }

            const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
                new: true,
                runValidators: true
            }).select('-password');

            if (!updatedUser) {
                throw new Error('Usuário não encontrado');
            }

            console.log(`Usuário ${id} atualizado com sucesso!`);
            return updatedUser;
        } catch (err) {
            console.log('Erro ao atualizar usuário: ', err);
            throw err instanceof Error ? err : new Error('Erro ao atualizar usuário');
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
