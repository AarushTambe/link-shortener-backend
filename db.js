const { Pool } = require("pg");

const pool = new Pool({
  host: 'ep-rough-union-a1esto9b-pooler.ap-southeast-1.aws.neon.tech',
  user: 'neondb_owner',
  password: 'npg_xTQlFYuP31XB',
  database: 'neondb',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
