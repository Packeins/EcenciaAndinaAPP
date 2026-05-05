-- 1. Agregar columna de opciones (JSONB)
ALTER TABLE public.Detalle_Orden ADD COLUMN opciones JSONB DEFAULT '{}'::jsonb;

-- 2. Migrar los datos viejos de 'sopa' y 'segundo' a la nueva columna 'opciones'
UPDATE public.Detalle_Orden 
SET opciones = jsonb_build_object(
    'sopa', sopa, 
    'segundo', segundo
) 
WHERE sopa IS NOT NULL OR segundo IS NOT NULL;

-- 3. Eliminar las columnas viejas
ALTER TABLE public.Detalle_Orden DROP COLUMN sopa;
ALTER TABLE public.Detalle_Orden DROP COLUMN segundo;
