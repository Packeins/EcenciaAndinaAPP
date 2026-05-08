-- Agregar las columnas de auditoría y operación faltantes en la tabla Ordenes
ALTER TABLE public.Ordenes ADD COLUMN IF NOT EXISTS id_empleado_atiende uuid references public.Empleados(id);
ALTER TABLE public.Ordenes ADD COLUMN IF NOT EXISTS metodo_pago text;
ALTER TABLE public.Ordenes ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();
ALTER TABLE public.Ordenes ADD COLUMN IF NOT EXISTS updated_by uuid;
