export function useMotionTemplate(strings: TemplateStringsArray, ...values: any[]) {
  const compute = () => strings.reduce((acc, str, i) => acc + str + (values[i]?.get?.() ?? values[i] ?? ''), '');
  return { get: compute, toString: compute };
}
