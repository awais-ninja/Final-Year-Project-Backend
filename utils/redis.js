require("dotenv").config();
const { promisify } = require("util");
const redis = require("redis");
const config = require("../config");

const client = redis.createClient({
  url: config.redis.url,
});

client.on("error", (err) => console.error("Redis client error", err));

client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.error("Failed to connect to Redis", err);
  });

const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

module.exports = { getAsync, setAsync, client };
