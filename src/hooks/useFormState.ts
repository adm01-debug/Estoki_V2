import { useState, useCallback } from 'react';
interface FormState { isDirty: boolean; isSubmitting: boolean; isSubmitted: boolean; isValid: boolean; submitCount: number; }
export function useFormState() {
  const [state, setState] = useState<FormState>({ isDirty: false, isSubmitting: false, isSubmitted: false, isValid: true, submitCount: 0 });
  const setDirty = useCallback(() => setState(s => ({ ...s, isDirty: true })), []);
  const setSubmitting = useCallback((v: boolean) => setState(s => ({ ...s, isSubmitting: v })), []);
  const setSubmitted = useCallback(() => setState(s => ({ ...s, isSubmitted: true, submitCount: s.submitCount + 1 })), []);
  const setValid = useCallback((v: boolean) => setState(s => ({ ...s, isValid: v })), []);
  const reset = useCallback(() => setState({ isDirty: false, isSubmitting: false, isSubmitted: false, isValid: true, submitCount: 0 }), []);
  return { ...state, setDirty, setSubmitting, setSubmitted, setValid, reset };
}
