import { useState, useCallback, ChangeEvent } from "react";

type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setValues(prev => ({ ...prev, [name]: newValue }));
  }, []);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }, []);

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setError = useCallback(<K extends keyof T>(name: K, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void> | void) => async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try { await onSubmit(values); } finally { setIsSubmitting(false); }
  }, [values]);

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, setValue, setError, setErrors, reset, handleSubmit };
}
