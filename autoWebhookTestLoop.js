require("dotenv").config({ path: ".env", quiet: true });
const axios = require("axios");
const crypto = require("crypto");

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Number of events to send
const NUM_EVENTS = 1;

// Delay between events in milliseconds
const DELAY_MS = 2000; // 2 seconds

// Generate payload
function generatePayload() {
  return {
    id: `evt_${Math.floor(Math.random() * 1000000)}`,
    timestamp: Math.floor(Date.now() / 1000),
    createdAt: new Date().toISOString(),
    event: "transaction.completed",
    data: {
      amount: Math.floor(Math.random() * 1000),
      currency: "ETB",
      cause: "Testing",
      full_name: "Abebe Kebede",
      account_name: "abebekebede1",
      invoice_url: process.env.INVOICE_URL,
    },
  };
}

// Flatten must match server exactly
function flatten(obj) {
  return Object.keys(obj)
    .sort()
    .map((key) =>
      typeof obj[key] === "object" ? JSON.stringify(obj[key]) : obj[key]
    )
    .join("");
}

// Generate HMAC
function generateHmac(payload) {
  const flat = flatten(payload);
  return crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(flat, "utf8")
    .digest("hex");
}

// Send single webhook
async function sendWebhook(payload) {
  const hmac = generateHmac(payload);
  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "YAYA-SIGNATURE": hmac,
      },
    });
    console.log("✅ Sent payload:", payload.id);
    console.log("   Payload JSON:", JSON.stringify(payload));
    console.log("   HMAC Signature:", hmac);
    console.log("   Response:", response.data);
  } catch (err) {
    console.error("❌ Error sending payload:", payload.id);

    if (err.response) {
      console.error("   Status:", err.response.status);
      console.error("   Headers:", err.response.headers);
      console.error("   Body:", err.response.data);
    } else if (err.request) {
      console.error("   No response received from server.");
      console.error("   Request details:", err.request);
    } else {
      console.error("   Request setup error:", err.message);
    }
  }
}

// Loop to send multiple events
async function sendMultipleWebhooks(numEvents, delayMs) {
  for (let i = 0; i < numEvents; i++) {
    const payload = generatePayload();
    await sendWebhook(payload);
    if (i < numEvents - 1) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

// Run
sendMultipleWebhooks(NUM_EVENTS, DELAY_MS);
