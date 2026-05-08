# Actualización Completa de Historias de Usuario (Jira)

A continuación se detallan los criterios de aceptación y validaciones finales implementadas para el módulo de Convenios.

---

## HU: Gestión de Ciclo de Vida y Renovación de Convenios

### Criterios de Aceptación:
1. **Validación de Fechas**: 
   - El sistema no debe permitir guardar un convenio (nuevo o renovado) si la **Fecha de Caducidad** es anterior a la **Fecha de Inicio**.
2. **Protección de Datos Históricos**:
   - Una vez creado un convenio, las fechas de inicio y fin no pueden ser modificadas directamente desde el formulario de edición (campos bloqueados).
3. **Flujo de Renovación**:
   - Se debe permitir la renovación tanto desde el toggle de estado (cuando está vencido) como desde un botón específico "Renovar vigencia" dentro del diálogo de edición.
   - Al renovar, el sistema debe solicitar el nuevo periodo y reactivar el convenio automáticamente.
4. **Generación de Contrato**:
   - Al crear un nuevo convenio o realizar una renovación, el sistema debe generar automáticamente el documento PDF/Imprimible para la firma de las partes.

---

## HU: Repositorio de Documentos Firmados y Historial

### Criterios de Aceptación:
1. **Gestión de Archivos Locales**:
   - El sistema debe permitir subir el archivo escaneado del convenio firmado.
   - Si no hay archivo cargado, se debe mostrar una alerta roja: *"⚠️ El convenio aún no cuenta con el documento firmado, por favor subirlo lo antes posible"*.
2. **Historial de Versiones**:
   - Al renovar un convenio, la versión anterior (fechas y archivo firmado) debe guardarse en un historial permanente.
   - El nuevo periodo debe iniciar con el campo de "archivo firmado" vacío, requiriendo una nueva subida.
3. **Consulta de Historial**:
   - El usuario debe poder acceder a una pestaña de "Historial" donde podrá consultar periodos anteriores y descargar los contratos firmados antiguos para auditoría.

---

## Validaciones Técnicas Implementadas:
- **Estado Visual**: Celeste (#00BFFF) para "Activo" y Rojo para "Vencido".
- **Bloqueo de Edición**: El botón de edición (lápiz) se deshabilita si el convenio está vencido, obligando al usuario a seguir el flujo de renovación.
- **Persistencia**: Uso de la tabla `ConvenioHistorial` para garantizar la integridad de los documentos legales de periodos pasados.
