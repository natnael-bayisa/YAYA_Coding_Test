require("dotenv").config({ path: ".env", quiet: true });
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
    : 60000, // default 1 min

  //defaults to 0 (no requests allowed) if the variable(RATE_LIMIT_MAX) is missing
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : "0", //
  message: "Too many requests, please try again later.",
});

module.exports = limiter;
