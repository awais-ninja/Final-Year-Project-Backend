const { Pool } = require("pg");
require("dotenv").config();
const config = require("../config");

const seed = require("./seed");
const pool = new Pool(config.psql);

(async () => {
  try {
    const seedData = await seed();

    const res = await pool.query(seedData);
  } catch (error) {
    console.log(error);
  }
})();

module.exports = pool;
