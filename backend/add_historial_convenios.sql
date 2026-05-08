CREATE TABLE IF NOT EXISTS public.ConvenioHistorial (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_convenio uuid REFERENCES public.Convenios(id_convenio) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_caducidad DATE NOT NULL,
  archivo_firmado TEXT,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentario para el usuario
-- Ejecutar este script en Supabase SQL Editor
