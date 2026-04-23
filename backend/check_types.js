require('dotenv').config();
const supabase = require('./src/config/supabase');

async function checkTypes() {
  console.log('--- Checking "Tipos_Cliente" table ---');
  const { data, error } = await supabase.from('Tipos_Cliente').select('*');
  if (error) {
    console.error('Error:', error.message);
    // try lowercase
    const { data: data2, error: error2 } = await supabase.from('tipos_cliente').select('*');
    if (error2) console.error('Error lowercase:', error2.message);
    else console.log('Success lowercase:', data2);
  } else {
    console.log('Success:', data);
  }
}

checkTypes();
