const { Pool } = require("pg");
require("dotenv").config();
const config = require("../config");

const pool = new Pool(config.psql);

// pool.query(`DROP TABLE users;`);
(async () => {
  const seed = await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(100) NOT NULL,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_admin BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP,
        last_logout TIMESTAMP,
        last_ip VARCHAR(50),
        last_device VARCHAR(50),
        last_location VARCHAR(50),
        
        CONSTRAINT users_username_key UNIQUE (username)
    )`);
  console.log(seed.command);
})();

module.exports = pool;
