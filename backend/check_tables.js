require('dotenv').config();
const supabase = require('./src/config/supabase');

async function checkTables() {
    console.log('--- Checking "Clientes" table ---');
    try {
        const { data: pluralData, error: pluralError } = await supabase.from('Clientes').select('*').limit(1);
        if (pluralError) console.error('Plural (Clientes) error:', pluralError.message);
        else console.log('Plural (Clientes) success:', pluralData);
    } catch (e) { console.error('Plural catch:', e.message); }

    console.log('\n--- Checking "clientes" table ---');
    try {
        const { data: lowerPluralData, error: lowerPluralError } = await supabase.from('clientes').select('*').limit(1);
        if (lowerPluralError) console.error('Lower Plural (clientes) error:', lowerPluralError.message);
        else console.log('Lower Plural (clientes) success:', lowerPluralData);
    } catch (e) { console.error('Lower Plural catch:', e.message); }

    console.log('\n--- Checking "Cliente" table ---');
    try {
        const { data: singularData, error: singularError } = await supabase.from('Cliente').select('*').limit(1);
        if (singularError) console.error('Singular (Cliente) error:', singularError.message);
        else console.log('Singular (Cliente) success:', singularData);
    } catch (e) { console.error('Singular catch:', e.message); }

    console.log('\n--- Checking "cliente" table ---');
    try {
        const { data: lowerSingularData, error: lowerSingularError } = await supabase.from('cliente').select('*').limit(1);
        if (lowerSingularError) console.error('Lower Singular (cliente) error:', lowerSingularError.message);
        else console.log('Lower Singular (cliente) success:', lowerSingularData);
    } catch (e) { console.error('Lower Singular catch:', e.message); }
}

checkTables();
