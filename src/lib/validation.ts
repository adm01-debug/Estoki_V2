export const validationRules = {
  required: (value: unknown) => value !== undefined && value !== null && value !== "" ? null : "Campo obrigatório",
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Email inválido",
  minLength: (min: number) => (value: string) => value.length >= min ? null : `Mínimo ${min} caracteres`,
  maxLength: (max: number) => (value: string) => value.length <= max ? null : `Máximo ${max} caracteres`,
  min: (min: number) => (value: number) => value >= min ? null : `Valor mínimo: ${min}`,
  max: (max: number) => (value: number) => value <= max ? null : `Valor máximo: ${max}`,
  pattern: (regex: RegExp, message: string) => (value: string) => regex.test(value) ? null : message,
};

export function validate<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, ((value: unknown) => string | null)[]>>
): Record<keyof T, string | null> {
  const errors = {} as Record<keyof T, string | null>;
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    if (!fieldRules) return;
    for (const rule of fieldRules) {
      const error = rule(data[field as keyof T]);
      if (error) {
        errors[field as keyof T] = error;
        break;
      }
    }
    if (!errors[field as keyof T]) errors[field as keyof T] = null;
  });
  
  return errors;
}
