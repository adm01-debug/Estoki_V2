import { useId, useMemo } from 'react';
export function useAriaDescribedBy(description: string) {
  const id = useId();
  const describedById = `desc-${id}`;
  const props = useMemo(() => ({ 'aria-describedby': describedById }), [describedById]);
  const descriptionProps = useMemo(() => ({ id: describedById, children: description }), [describedById, description]);
  return { props, descriptionProps, id: describedById };
}
