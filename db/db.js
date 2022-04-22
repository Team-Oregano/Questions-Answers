const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  // idleTImeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

pool
  .connect()
  .then(() => console.log(`PGsql connected on port ${process.env.PG_PORT} *****`))
  .catch((err) => console.log(err));

// pool.query('Select * from answers_photos', (err, res) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(res.rows)
//   }
//   pool.end;
// })

module.exports = pool;