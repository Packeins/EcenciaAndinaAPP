const express = require('express');
const router = express.Router();
const { getAdminClient } = require('../config/supabase');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// --- RUTAS PARA CATEGORIAS DE MENU ---

// Obtener todas las categorías de menú
router.get('/categorias', roleMiddleware(['administrador', 'caja']), async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('categorias_menu')
      .select('*')
      .order('nombre_categoria', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS PARA ALIMENTOS ---

// Obtener todos los alimentos (con su categoría)
router.get('/', roleMiddleware(['administrador', 'caja']), async (req, res) => {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('alimentos')
      .select(`
        id_alimento,
        nombre_alimento,
        id_categoria_menu
      `)
      .order('nombre_alimento', { ascending: true });

    if (error) {
      throw error;
    }

    const formatted = data.map(item => ({
      id: item.id_alimento,
      nombre: item.nombre_alimento,
      id_categoria: item.id_categoria_menu
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo alimento
router.post('/', roleMiddleware(['administrador', 'caja']), async (req, res) => {
  const { id_categoria, nombre } = req.body;
  try {
    const adminClient = getAdminClient();
    
    // Primero verificamos si ya existe uno igual para no duplicar
    const { data: existing } = await adminClient
      .from('alimentos')
      .select('*')
      .eq('nombre_alimento', nombre)
      .eq('id_categoria_menu', id_categoria)
      .single();
    
    if (existing) {
      return res.json({
        id: existing.id_alimento,
        nombre: existing.nombre_alimento,
        id_categoria: existing.id_categoria_menu
      });
    }

    const { data, error } = await adminClient
      .from('alimentos')
      .insert([
        {
          id_categoria_menu: id_categoria,
          nombre_alimento: nombre,
          created_by: req.user.id
        }
      ])
      .select('*, categorias_menu(nombre_categoria)')
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id_alimento,
      nombre: data.nombre_alimento,
      id_categoria: data.id_categoria_menu,
      categoria_nombre: data.categorias_menu?.nombre_categoria
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
