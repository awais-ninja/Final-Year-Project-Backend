const { Pool } = require("pg");
require("dotenv").config();
const config = require("../config");

const pool = new Pool(config.psql);

module.exports = pool;
