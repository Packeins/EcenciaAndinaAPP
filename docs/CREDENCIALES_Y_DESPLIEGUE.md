# Credenciales y despliegue

Este archivo explica que valores debe entregar el administrador del proyecto para que otro colaborador pueda ejecutar Ecencia Andina sin subir secretos al repositorio.

## Archivos que cada colaborador debe crear

- `backend/.env.local`: credenciales del backend y URL del webhook de n8n.
- `frontend/.env`: variables publicas del frontend.
- `backend/n8n/eciencia-n8n.env`: variables del contenedor n8n.

Usa estos ejemplos como plantilla:

- `backend/.env.example`
- `frontend/.env.example`
- `backend/n8n/eciencia-n8n.env.example`

## Secretos que debes compartir por canal privado

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` o `VITE_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL` si el colaborador va a aplicar scripts administrativos o conectar n8n a Postgres.
- `TELEGRAM_BOT_TOKEN`
- `N8N_ENCRYPTION_KEY`
- Credenciales Postgres usadas por n8n: `DB_POSTGRESDB_HOST`, `DB_POSTGRESDB_USER`, `DB_POSTGRESDB_PASSWORD`, `DB_POSTGRESDB_DATABASE`, `DB_POSTGRESDB_SCHEMA`.
- `MENU_IMAGE_RETENTION_DAYS` si se quiere cambiar la retencion por defecto de 14 dias para imagenes de menus.

Nunca pegues esos valores en GitHub, issues, commits, capturas publicas o mensajes del README.

## Link de registro del bot

El cliente debe iniciar conversacion con el bot. Telegram no permite que el bot escriba primero a un usuario nuevo.

Formato:

```txt
https://t.me/NOMBRE_DEL_BOT
```

Bot usado en pruebas locales:

```txt
https://t.me/ECIENCIATESTEBOT
```

Flujo de alta:

1. El cliente abre el link del bot.
2. Envia `/start`.
3. Acepta el aviso de privacidad.
4. Comparte su telefono.
5. El workflow valida el telefono contra `clientes`.
6. Si el cliente esta activo, se guarda la suscripcion en `telegram_subscriptions`.

## Produccion

- Usar HTTPS para frontend/backend.
- Configurar `N8N_MENU_WEBHOOK_URL` del backend apuntando al webhook real de n8n.
- Activar solo una instancia de polling para el bot de Telegram.
- Verificar que `getWebhookInfo.url` este vacio si el workflow usa polling.
- En Supabase, mantener `telegram_subscriptions` sin acceso directo para `anon` y `authenticated`.
- Revisar `telegram_order_traces` cuando un pedido automatico falle o un cliente envie un formato invalido.
