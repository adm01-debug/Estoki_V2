import { useId, useMemo } from 'react';
export function useAriaLabel(label: string) {
  const id = useId();
  const labelId = `label-${id}`;
  const props = useMemo(() => ({ 'aria-labelledby': labelId }), [labelId]);
  const labelProps = useMemo(() => ({ id: labelId, children: label }), [labelId, label]);
  return { props, labelProps, id: labelId };
}
