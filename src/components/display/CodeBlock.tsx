import React from "react";
import { cn } from "@/lib/utils";
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}
export function CodeBlock({
  code,
  language = "javascript",
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const lines = code.split("\n");
  return (
    <div className={cn("overflow-hidden rounded-lg bg-gray-900", className)}>
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-xs text-gray-400">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-sm text-gray-100">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && <span className="w-8 select-none text-gray-500">{i + 1}</span>}
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
