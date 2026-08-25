/**
 * Validação de CPF (algoritmo oficial dos dígitos verificadores).
 * Não valida se o CPF "existe" na Receita Federal — apenas se os
 * dígitos são matematicamente consistentes. Isso já barra a grande
 * maioria dos CPFs inventados (ex: 111.111.111-11, 123.456.789-00).
 */

/**
 * Remove tudo que não for dígito.
 * @param {string} cpf
 * @returns {string}
 */
export function onlyDigits(cpf) {
    return String(cpf || '').replace(/\D/g, '');
}

/**
 * Valida um CPF (com ou sem máscara).
 * @param {string} cpf
 * @returns {boolean}
 */
export function isValidCPF(cpf) {
    const clean = onlyDigits(cpf);

    if (clean.length !== 11) return false;

    // CPFs com todos os dígitos iguais são inválidos (mas passariam
    // no cálculo do dígito verificador, por isso o bloqueio manual)
    if (/^(\d)\1{10}$/.test(clean)) return false;

    const digits = clean.split('').map(Number);

    const calcCheckDigit = (base) => {
        let sum = 0;
        let weight = base.length + 1;
        for (const digit of base) {
            sum += digit * weight;
            weight--;
        }
        const rest = sum % 11;
        return rest < 2 ? 0 : 11 - rest;
    };

    const firstCheck = calcCheckDigit(digits.slice(0, 9));
    if (firstCheck !== digits[9]) return false;

    const secondCheck = calcCheckDigit(digits.slice(0, 10));
    if (secondCheck !== digits[10]) return false;

    return true;
}

export default { isValidCPF, onlyDigits };
