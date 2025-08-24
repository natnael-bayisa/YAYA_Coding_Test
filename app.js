const express = require("express");
const bodyParser = require("body-parser");

//controller(s)
const webhookController = require("./controllers/webhookController");

//middlewares
const limiter = require("./middleware/rateLimiter");
const verifySignature = require("./middleware/verifySignature");
const verifyIp = require("./middleware/verifyIp");

const app = express();

app.use(bodyParser.json());

// Webhook endpoint
app.post(
  "/webhooks/yaya",
  limiter,
  verifyIp,
  verifySignature,
  webhookController.handleWebhook
);

module.exports = app;
