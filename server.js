require("dotenv").config({ path: ".env", quiet: true });

const app = require("./app");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ YaYa Webhook server running on http://localhost:${PORT}`);
});
