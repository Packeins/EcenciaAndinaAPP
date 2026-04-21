require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    try {
        console.log('Testing query on Empleados...');
        const { data, error } = await supabase
            .from('empleados')
            .select(`
                id,
                nombre,
                apellido,
                correo,
                nombre_usuario,
                esta_activo,
                created_at,
                roles (nombre_rol)
            `);

        if (error) {
            console.error('Error in query:', error);
            return;
        }

        console.log('Data found:', data.length, 'records');
        console.log('First record:', data[0]);
    } catch (err) {
        console.error('Exception:', err);
    }
}

testQuery();
