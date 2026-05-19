import { useState, useCallback, useMemo } from 'react';

export interface CountItem { 
  sku: string; 
  expected: number; 
  counted: number; 
  variance: number; 
}

export function useInventoryCount() {
  const [items, setItems] = useState<CountItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const addCount = useCallback((sku: string, expected: number, counted: number) => { 
    setItems(prev => {
      const existing = prev.find(i => i.sku === sku);
      if (existing) {
        return prev.map(i => i.sku === sku ? { ...i, counted, variance: counted - i.expected } : i);
      }
      return [...prev, { sku, expected, counted, variance: counted - expected }];
    });
  }, []);

  const updateCount = useCallback((sku: string, counted: number) => { 
    setItems(prev => prev.map(item => 
      item.sku === sku ? { ...item, counted, variance: counted - item.expected } : item
    )); 
  }, []);

  const totalVariance = useMemo(() => 
    items.reduce((acc, i) => acc + i.variance, 0), 
  [items]);

  const accuracy = useMemo(() => { 
    const total = items.reduce((acc, i) => acc + i.expected, 0); 
    const matched = items.filter(i => i.variance === 0).reduce((acc, i) => acc + i.expected, 0); 
    return total > 0 ? (matched / total) * 100 : 0; 
  }, [items]);

  const clear = useCallback(() => setItems([]), []);

  return { 
    items, 
    addCount, 
    updateCount, 
    getTotalVariance: () => totalVariance, 
    getAccuracy: () => accuracy, 
    isComplete, 
    setIsComplete, 
    clear 
  };
}
