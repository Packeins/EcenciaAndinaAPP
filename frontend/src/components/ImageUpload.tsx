import { useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden min-h-[240px] flex flex-col items-center justify-center gap-4",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
          value ? "border-none" : ""
        )}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover max-h-[400px]" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer">
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Click o arrastra la foto del menú</p>
              <p className="text-xs text-muted-foreground mt-1">Soporta JPG, PNG o WebP</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
