import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
interface RichTextEditorProps { value?: string; onChange?: (html: string) => void; placeholder?: string; }
export function RichTextEditor({ value = '', onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({ extensions: [StarterKit], content: value, onUpdate: ({ editor }) => onChange?.(editor.getHTML()) });
  if (!editor) return null;
  return (<div className="border rounded-md"><div className="flex gap-1 p-2 border-b"><Button size="icon" variant={editor.isActive('bold') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Button><Button size="icon" variant={editor.isActive('italic') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Button><Button size="icon" variant={editor.isActive('bulletList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></Button><Button size="icon" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Button></div><EditorContent editor={editor} className="p-3 min-h-[150px] prose max-w-none" /></div>);
}
