export function useMotionTemplate(strings: TemplateStringsArray, ...values: unknown[]) {
  const compute = () => strings.reduce((acc, str, i) => acc + str + ((values[i] as { get?: () => string })?.get?.() ?? values[i] ?? ''), '');
  return { get: compute, toString: compute };
}
