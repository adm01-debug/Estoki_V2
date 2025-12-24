import { useFormContext as useRHFFormContext, FieldValues } from 'react-hook-form';

export function useFormContext<T extends FieldValues = FieldValues>() {
  const context = useRHFFormContext<T>();
  
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  const { register, formState, watch, setValue, getValues, control, handleSubmit, reset, trigger } = context;

  return {
    register,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    isDirty: formState.isDirty,
    isValid: formState.isValid,
    watch,
    setValue,
    getValues,
    control,
    handleSubmit,
    reset,
    trigger,
    formState,
  };
}
