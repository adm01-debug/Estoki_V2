import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
interface FormContextValue { values: Record<string, any>; errors: Record<string, string>; setValue: (name: string, value: any) => void; setError: (name: string, error: string) => void; reset: () => void; }
const FormContext = createContext<FormContextValue | null>(null);
export function useFormContext() { const ctx = useContext(FormContext); if (!ctx) throw new Error('useFormContext must be used within FormProvider'); return ctx; }
export function FormProvider({ children, defaultValues = {} }: { children: ReactNode; defaultValues?: Record<string, any> }) {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setValue = useCallback((name: string, value: any) => setValues(v => ({ ...v, [name]: value })), []);
  const setError = useCallback((name: string, error: string) => setErrors(e => ({ ...e, [name]: error })), []);
  const reset = useCallback(() => { setValues(defaultValues); setErrors({}); }, [defaultValues]);
  return <FormContext.Provider value={{ values, errors, setValue, setError, reset }}>{children}</FormContext.Provider>;
}
