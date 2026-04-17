const mysql = require('mysql2/promise');

// Creamos un pool de conexiones para mayor eficiencia
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db', // Docker resuelve "db" como la IP del contenedor
  user: process.env.MYSQL_USER || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prueba rápida de conexión al iniciar
pool.getConnection()
  .then(conn => {
    console.log("✅ Conexión exitosa a la base de datos en Docker");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Error conectando a la base de datos:", err.message);
  });

module.exports = pool;