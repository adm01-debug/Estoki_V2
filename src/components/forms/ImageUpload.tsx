import React, { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  value?: string[];
  multiple?: boolean;
  className?: string;
}
export function ImageUpload({ onUpload, value = [], multiple, className }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(value);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
    onUpload(files);
  };
  const remove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };
  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border-2 border-dashed p-4 text-center">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <ImageIcon className="mx-auto mb-1 h-8 w-8 text-muted-foreground" />
          <p className="text-sm">Upload images</p>
        </label>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`Preview ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="h-20 w-full rounded object-cover"
              />
              <X
                className="absolute right-1 top-1 h-4 w-4 cursor-pointer rounded bg-black/50 text-white"
                onClick={() => remove(i)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
