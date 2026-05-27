const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getAdminClient } = require('../config/supabase');

const router = express.Router();

const DEFAULT_N8N_MENU_WEBHOOK_URL = 'http://localhost:7000/webhook/eciencia-enviar-menu-manual';
const MENU_ASSETS_BUCKET = 'eciencia-menu-assets';
const TIMEZONE = 'America/Bogota';

router.use(authMiddleware);
router.use(roleMiddleware(['administrador', 'caja']));

const cleanOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options.map((option) => String(option || '').trim()).filter(Boolean);
};

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const todayInTimezone = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const buildMenuPayload = (body) => ({
  sopas: cleanOptions(body.sopas),
  segundos: cleanOptions(body.segundos),
  guarniciones: cleanOptions(body.guarniciones),
});

const mimeToExtension = (mimeType) => {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
};

const uploadMenuImage = async (image) => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;

  const match = String(image).match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/i);
  if (!match) {
    const error = new Error('La imagen del menu debe ser JPG, PNG, WebP o una URL publica.');
    error.status = 400;
    throw error;
  }

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = `telegram/menu-dashboard-${Date.now()}.${mimeToExtension(mimeType.toLowerCase())}`;
  const adminClient = getAdminClient();

  const { error } = await adminClient.storage.from(MENU_ASSETS_BUCKET).upload(fileName, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`No se pudo subir la imagen del menu: ${error.message}`);
  }

  const { data } = adminClient.storage.from(MENU_ASSETS_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
};

const getCategoryIds = async (adminClient) => {
  const { data, error } = await adminClient
    .from('categorias_menu')
    .select('id_categoria_menu,nombre_categoria');

  if (error) throw error;

  const categories = {};
  for (const row of data || []) {
    const name = normalizeText(row.nombre_categoria);
    if (name.includes('sopa')) categories.sopas = row.id_categoria_menu;
    if (name.includes('segundo') || name.includes('plato')) categories.segundos = row.id_categoria_menu;
    if (name.includes('guarn')) categories.guarniciones = row.id_categoria_menu;
  }

  if (!categories.sopas || !categories.segundos || !categories.guarniciones) {
    const error = new Error('Faltan categorias de menu: Sopa, Segundo y Guarnicion.');
    error.status = 500;
    throw error;
  }

  return categories;
};

const ensureAlimento = async (adminClient, idCategoria, nombre, userId) => {
  const { data: existing, error: selectError } = await adminClient
    .from('alimentos')
    .select('id_alimento,nombre_alimento')
    .eq('id_categoria_menu', idCategoria)
    .ilike('nombre_alimento', nombre)
    .limit(1)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing.id_alimento;

  const { data, error } = await adminClient
    .from('alimentos')
    .insert({
      id_categoria_menu: idCategoria,
      nombre_alimento: nombre,
      created_by: userId,
    })
    .select('id_alimento')
    .single();

  if (error) throw error;
  return data.id_alimento;
};

const saveDailyMenu = async (adminClient, menu, imageUrl, userId) => {
  const fecha = todayInTimezone();
  const categoryIds = await getCategoryIds(adminClient);
  const alimentosIds = [];

  for (const [key, options] of Object.entries(menu)) {
    for (const option of options) {
      alimentosIds.push(await ensureAlimento(adminClient, categoryIds[key], option, userId));
    }
  }

  const { error: deleteError } = await adminClient.from('menu_diario').delete().eq('fecha', fecha);
  if (deleteError) throw deleteError;

  if (!alimentosIds.length) return { fecha, count: 0 };

  const rows = alimentosIds.map((idAlimento) => ({
    fecha,
    id_alimento: idAlimento,
    imagen_url: imageUrl,
    created_by: userId,
  }));

  const { error: insertError } = await adminClient.from('menu_diario').insert(rows);
  if (insertError) throw insertError;

  return { fecha, count: rows.length };
};

router.post('/enviar', async (req, res) => {
  try {
    const menu = buildMenuPayload(req.body || {});
    if (!menu.sopas.length || !menu.segundos.length || !menu.guarniciones.length) {
      return res.status(400).json({
        error: 'Debe haber al menos una sopa, un segundo y una guarnicion configurados.',
      });
    }

    const photoUrl = await uploadMenuImage(req.body?.image);
    const adminClient = getAdminClient();
    const dailyMenu = await saveDailyMenu(adminClient, menu, photoUrl, req.user.id);
    const webhookUrl = process.env.N8N_MENU_WEBHOOK_URL || DEFAULT_N8N_MENU_WEBHOOK_URL;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'dashboard',
        requestedBy: {
          id: req.user.id,
          email: req.user.email,
          rol: req.user.rol,
        },
        menu,
        photoUrl,
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`n8n respondio ${response.status}: ${responseText}`);
    }

    res.status(202).json({
      mensaje: 'Flujo de Telegram disparado correctamente.',
      webhookStatus: response.status,
      dailyMenu,
      photoUrl,
    });
  } catch (error) {
    console.error('Error disparando flujo de menu en n8n:', error);
    res.status(error.status || 500).json({
      error: error.message || 'No se pudo disparar el flujo de Telegram.',
    });
  }
});

module.exports = router;
