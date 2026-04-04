import { useState, useCallback, useMemo } from 'react';

type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean;
  message: string;
};

type FieldConfig<T> = {
  initialValue: T[keyof T];
  rules?: ValidationRule<T>[];
};

type FormConfig<T> = { [K in keyof T]: FieldConfig<T> };

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  validate: () => boolean;
}

export function useForm<T extends Record<string, unknown>>(config: FormConfig<T>): UseFormReturn<T> {
  const initialValues = useMemo(() => {
    const values: Partial<T> = {};
    for (const key in config) values[key] = config[key].initialValue as T[typeof key];
    return values as T;
  }, []);

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialValues), [values, initialValues]);

  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | null => {
    const rules = config[field as string]?.rules || [];
    for (const rule of rules) {
      if (!rule.validate(value, values)) return rule.message;
    }
    return null;
  }, [config, values]);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in config) {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [config, values, validateField]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => error ? { ...prev, [field]: error } : (delete prev[field], { ...prev }));
  }, [validateField]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => { delete prev[field]; return { ...prev }; });
  }, []);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    if (error) setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField, values]);

  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      e?.preventDefault();
      setTouched(Object.keys(config).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      
      if (!validate()) return;
      
      setIsSubmitting(true);
      try { await onSubmit(values); }
      finally { setIsSubmitting(false); }
    };
  }, [config, validate, values]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, isValid, isDirty, isSubmitting, setValue, setValues, setError, clearError, handleBlur, handleSubmit, reset, validate };
}

// Validation helpers
export const validators = {
  required: <T extends Record<string, unknown>>(message = 'Campo obrigatório'): ValidationRule<T> => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message,
  }),
  minLength: <T extends Record<string, unknown>>(min: number, message?: string): ValidationRule<T> => ({
    validate: (value) => typeof value === 'string' && value.length >= min,
    message: message || `Mínimo ${min} caracteres`,
  }),
  maxLength: <T extends Record<string, unknown>>(max: number, message?: string): ValidationRule<T> => ({
    validate: (value) => typeof value === 'string' && value.length <= max,
    message: message || `Máximo ${max} caracteres`,
  }),
  email: <T extends Record<string, unknown>>(message = 'Email inválido'): ValidationRule<T> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
    message,
  }),
  min: <T extends Record<string, unknown>>(min: number, message?: string): ValidationRule<T> => ({
    validate: (value) => Number(value) >= min,
    message: message || `Valor mínimo: ${min}`,
  }),
  max: <T extends Record<string, unknown>>(max: number, message?: string): ValidationRule<T> => ({
    validate: (value) => Number(value) <= max,
    message: message || `Valor máximo: ${max}`,
  }),
  pattern: <T extends Record<string, unknown>>(regex: RegExp, message: string): ValidationRule<T> => ({
    validate: (value) => regex.test(String(value)),
    message,
  }),
};

export default useForm;
