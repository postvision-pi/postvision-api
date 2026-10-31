import { describe, expect, it } from 'vitest';
import { isValidCPF, onlyDigits } from '../utils/cpfValidator.js';

describe('onlyDigits', () => {
    it('remove a máscara do CPF e do telefone', () => {
        expect(onlyDigits('529.982.247-25')).toBe('52998224725');
        expect(onlyDigits('(11) 99999-1234')).toBe('11999991234');
    });

    it.each([undefined, null, ''])('aceita um valor vazio: %s', value => {
        expect(onlyDigits(value)).toBe('');
    });
});

describe('isValidCPF', () => {
    it.each(['52998224725', '529.982.247-25', '11144477735'])(
        'aceita dígitos verificadores válidos: %s', value => {
            expect(isValidCPF(value)).toBe(true);
        }
    );

    it.each([
        '', null, undefined, 'abc', '5299822472', '529982247255',
        '52998224735', '52998224724', '00000000000', '11111111111', '99999999999'
    ])('rejeita CPF inválido: %s', value => {
        expect(isValidCPF(value)).toBe(false);
    });
});
