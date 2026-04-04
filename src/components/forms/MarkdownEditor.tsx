import React, { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit } from 'lucide-react';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const parseMarkdown = (md: string): string => {
  const raw = md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');

  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'strong', 'em', 'code', 'br', 'p', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};

export function MarkdownEditor({ value = '', onChange }: MarkdownEditorProps) {
  const [content, setContent] = useState(value);

  const handleChange = (v: string) => {
    setContent(v);
    onChange?.(v);
  };

  const sanitizedHtml = useMemo(() => parseMarkdown(content), [content]);

  return (
    <Tabs defaultValue="edit" className="w-full">
      <TabsList>
        <TabsTrigger value="edit">
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </TabsTrigger>
        <TabsTrigger value="preview">
          <Eye className="w-4 h-4 mr-1" />
          Preview
        </TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[200px] font-mono"
        />
      </TabsContent>
      <TabsContent value="preview">
        <div
          className="p-4 border rounded-md min-h-[200px] prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </TabsContent>
    </Tabs>
  );
}
