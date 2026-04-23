## Plan: Mejoras al Login y módulo de Pedidos

### 1. Login — Quitar selector de Rol

- Eliminar el campo `Select` de "Rol" en `src/pages/Login.tsx`.
- El rol se determinará automáticamente desde los datos del usuario (mock por ahora). Para mantener la demo funcional, definiré reglas simples:
  - Emails que contengan `admin` → rol `administrador`.
  - Cualquier otro email → rol `caja`.
- Ajustar `AuthContext.login()` para que ya no reciba `rol` como parámetro y lo derive del email.
- Redirección posterior al login se mantendrá según el rol detectado.

### 2. Pedidos — Botón "Nuevo Pedido"

- Agregar botón "Nuevo Pedido" en el header de `src/pages/Pedidos.tsx` (junto al contador de pendientes).
- Crear un nuevo componente `src/components/orders/NewOrderDialog.tsx` que reutilice la estructura de `EditOrderDialog`, pero permitiendo:
  - Seleccionar/buscar cliente existente (de `mockClients`) o ingresar uno nuevo (nombre + WhatsApp + tipo).
  - Si el cliente es de convenio, asociarlo a un convenio.
  - Elegir tipo de almuerzo (Normal / VIP / Ejecutivo) con sus opciones de plato fuerte y sopa (ver punto 4).
  - Cantidad, observaciones y, si aplica (convenio), productos adicionales con buscador.
- Al guardar, agregar el pedido al state `orders` con estado `reservado` y fecha/hora actuales.

### 3. Productos Adicionales — Buscador

- En `EditOrderDialog` y `NewOrderDialog`, reemplazar la lista de botones por:
  - Un `Input` con icono de búsqueda que filtra `mockProducts` por nombre/categoría en tiempo real.
  - Una lista scrolleable (max-height) de resultados con botón "Agregar" en cada fila, mostrando precio.
  - La lista de productos seleccionados se mantiene debajo, con cantidades y total.
- Ampliar `mockProducts` en `src/data/mockData.ts` para tener un catálogo más amplio (15-20 productos en categorías como Bebidas, Snacks, Postres, Extras) que justifique el buscador.

### 4. Almuerzo editable — Tipo + Plato fuerte + Sopa

- Extender el modelo `Order` en `src/types/index.ts`:
  - `tipoAlmuerzo: 'normal' | 'vip' | 'ejecutivo'`
  - `platoFuerte: string` (una de 2 opciones del día)
  - `sopa: string` (una de 2 opciones del día)
  - Mantener `almuerzo: string` como descripción derivada (ej: "Ejecutivo — Lomo saltado + Crema de zapallo") para no romper la tabla actual.
- Definir constantes del menú del día en `mockData.ts`:
  - `tiposAlmuerzo`: Normal, VIP, Ejecutivo (con precio base de cada uno).
  - `platosFuertes`: 2 opciones (ej: "Lomo Saltado", "Pollo a la Plancha").
  - `sopas`: 2 opciones (ej: "Crema de Zapallo", "Sopa Criolla").
- En los diálogos de Editar y Nuevo Pedido, agregar tres `Select` (o `RadioGroup`) para elegir Tipo, Plato fuerte y Sopa. Recalcular el campo `almuerzo` al guardar.
- Migrar `mockOrders` a la nueva estructura para que la tabla siga renderizando correctamente.

### Archivos a modificar / crear

- Modificar: `src/pages/Login.tsx`, `src/contexts/AuthContext.tsx`, `src/pages/Pedidos.tsx`, `src/components/orders/EditOrderDialog.tsx`, `src/data/mockData.ts`, `src/types/index.ts`.
- Crear: `src/components/orders/NewOrderDialog.tsx` (puede compartir un sub-componente "OrderForm" con EditOrderDialog si conviene; por simplicidad inicial será independiente).

### Notas de UX

- Buscador de productos: foco automático al abrir, placeholder "Buscar producto…", mensaje "Sin resultados" cuando aplique.
- Selectores de almuerzo: agrupados visualmente en una sección "Almuerzo" con label clara.
- Validaciones mínimas en Nuevo Pedido: cliente (nombre + WhatsApp), tipo de almuerzo, plato fuerte, sopa y cantidad ≥ 1.
