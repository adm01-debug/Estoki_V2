import { useRef, useCallback, useState } from 'react';
interface ControllerConfig<T> { name: string; defaultValue?: T; rules?: { required?: boolean; min?: number; max?: number; pattern?: RegExp }; }
export function useController<T>({ name, defaultValue, rules }: ControllerConfig<T>) {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const validate = useCallback(() => {
    if (rules?.required && !value) { setError('Campo obrigatório'); return false; }
    if (rules?.pattern && typeof value === 'string' && !rules.pattern.test(value)) { setError('Formato inválido'); return false; }
    setError(null); return true;
  }, [value, rules]);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setValue(e.target.value as unknown as T); }, []);
  return { field: { name, value, onChange, ref }, fieldState: { error }, validate };
}
