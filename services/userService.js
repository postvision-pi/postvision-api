import User from '../models/Users.js';
import bcrypt from 'bcryptjs';

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