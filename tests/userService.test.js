import { beforeEach, describe, expect, it, vi } from 'vitest';
import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import userService from '../services/userService.js';

const fields = ['Ana', 'Exemplo', 'ana@example.test', 'Senha123!', '2000-01-01', '529.982.247-25', 'Feminino', '(11) 99999-1234'];

beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));

describe('cadastro de usuário (banco simulado)', () => {
    it('rejeita CPF inválido antes de consultar o banco', async () => {
        const find = vi.spyOn(User, 'findOne');
        const invalid = [...fields];
        invalid[5] = '11111111111';
        await expect(userService.createUser(...invalid)).rejects.toThrow('CPF inválido');
        expect(find).not.toHaveBeenCalled();
    });
    it.each([[1, 'e-mail'], [2, 'telefone'], [3, 'CPF']])('rejeita duplicidade na consulta %i', async (position, field) => {
        const find = vi.spyOn(User, 'findOne').mockResolvedValue(null);
        for (let i = 1; i < position; i++) find.mockResolvedValueOnce(null);
        find.mockResolvedValueOnce({ _id: 'existente' });
        await expect(userService.createUser(...fields)).rejects.toThrow(field);
    });
    it('normaliza documentos e grava a senha com hash bcrypt', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        const save = vi.spyOn(User.prototype, 'save').mockImplementation(async function () { return this; });
        const user = await userService.createUser(...fields);
        expect(user.cpf).toBe('52998224725');
        expect(user.phone).toBe('11999991234');
        expect(user.password).not.toBe(fields[3]);
        expect(await bcrypt.compare(fields[3], user.password)).toBe(true);
        expect(save).toHaveBeenCalledOnce();
    });
});

describe('atualização parcial de usuário', () => {
    it('altera apenas os campos enviados e não devolve a senha', async () => {
        const select = vi.fn().mockResolvedValue({ _id: '123', firstName: 'Novo nome' });
        const update = vi.spyOn(User, 'findByIdAndUpdate').mockReturnValue({ select });
        const result = await userService.Update('123', { firstName: 'Novo nome', password: '' });
        expect(update).toHaveBeenCalledWith('123', { firstName: 'Novo nome' }, { new: true, runValidators: true });
        expect(select).toHaveBeenCalledWith('-password');
        expect(result).toEqual({ _id: '123', firstName: 'Novo nome' });
    });
    it('rejeita CPF inválido na atualização', async () => {
        await expect(userService.Update('123', { cpf: '11111111111' })).rejects.toThrow('CPF inválido');
    });
    it('informa usuário não encontrado', async () => {
        vi.spyOn(User, 'findByIdAndUpdate').mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
        await expect(userService.Update('123', { firstName: 'Ana' })).rejects.toThrow('Usuário não encontrado');
    });
});
