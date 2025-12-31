import { useState, useEffect } from 'react';
export function useABTest(testName: string, variants: string[]) {
  const [variant, setVariant] = useState<string>(() => {
    const stored = localStorage.getItem(`ab_${testName}`);
    if (stored && variants.includes(stored)) return stored;
    const selected = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(`ab_${testName}`, selected);
    return selected;
  });
  return { variant, isVariant: (v: string) => variant === v };
}
