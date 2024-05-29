const redis = require("redis");
require("dotenv").config();
const config = require("../config");

const client = redis.createClient(config.redis);

client.on("error", (err) => console.error("Redis client error", err));

client.connect();

module.exports = client;
