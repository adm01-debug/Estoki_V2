import React from 'react';
import { cn } from '@/lib/utils';
interface CodeBlockProps { code: string; language?: string; showLineNumbers?: boolean; className?: string; }
export function CodeBlock({ code, language = 'javascript', showLineNumbers = true, className }: CodeBlockProps) {
  const lines = code.split('\n');
  return (
    <div className={cn('bg-gray-900 rounded-lg overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800"><span className="text-xs text-gray-400">{language}</span></div>
      <pre className="p-4 overflow-x-auto"><code className="text-sm text-gray-100">{lines.map((line, i) => (
        <div key={i} className="flex">{showLineNumbers && <span className="select-none text-gray-500 w-8">{i + 1}</span>}<span>{line}</span></div>
      ))}</code></pre>
    </div>
  );
}
