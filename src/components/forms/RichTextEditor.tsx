import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}
export function RichTextEditor({ value = "", onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }: { editor: { getHTML(): string } }) => onChange?.(editor.getHTML()),
  });
  if (!editor) return null;
  return (
    <div className="rounded-md border">
      <div className="flex gap-1 border-b p-2">
        <Button
          size="icon"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="prose min-h-[150px] max-w-none p-3" />
    </div>
  );
}
