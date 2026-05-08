-- Agregar columna para la URL del archivo firmado
ALTER TABLE public.Convenios ADD COLUMN IF NOT EXISTS archivo_firmado text;
