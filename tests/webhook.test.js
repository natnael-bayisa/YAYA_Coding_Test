require("dotenv").config({ path: ".env", quiet: true });
const request = require("supertest");
const crypto = require("crypto");
const app = require("../app");
// Secret must match your .env or app configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Flatten function to match server logic
function flatten(obj) {
  return Object.keys(obj)
    .sort()
    .map((key) =>
      typeof obj[key] === "object" ? JSON.stringify(obj[key]) : obj[key]
    )
    .join("");
}

// Generate HMAC signature for payload

function generateHmac(payload) {
  const flat = flatten(payload);
  return crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(flat, "utf8")
    .digest("hex");
}

describe("Webhook endpoint", () => {
  it("rejects missing signature", async () => {
    const res = await request(app).post("/webhooks/yaya").send({});
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Missing signature");
  });

  it("rejects invalid signature", async () => {
    const payload = {
      id: "evt_test1",
      timestamp: Math.floor(Date.now() / 1000),
    };
    const res = await request(app)
      .post("/webhooks/yaya")
      .set("YAYA-SIGNATURE", "invalidsignature")
      .send(payload);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid signature");
  });

  it("accepts valid signature", async () => {
    const payload = {
      id: `evt_${Math.floor(Math.random() * 100000)}`,
      timestamp: Math.floor(Date.now() / 1000),
      createdAt: new Date().toISOString(),
      event: "transaction.completed",
      data: {
        amount: 100,
        currency: "ETB",
        cause: "Testing",
        full_name: "Abebe Kebede",
        account_name: "abebekebede1",
        invoice_url: process.env.INVOICE_URL,
      },
    };
    const hmac = generateHmac(payload);
    const res = await request(app)
      .post("/webhooks/yaya")
      .set("YAYA-SIGNATURE", hmac)
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Event received");
  });

  it("ignores duplicate event", async () => {
    const payload = {
      id: `evt_duplicate`,
      timestamp: Math.floor(Date.now() / 1000),
      createdAt: new Date().toISOString(),

      event: "transaction.completed",
      data: {
        amount: 100,
        currency: "ETB",
        cause: "Testing",
        full_name: "Abebe Kebede",
        account_name: "abebekebede1",
        invoice_url: process.env.INVOICE_URL,
      },
    };
    const hmac = generateHmac(payload);

    // First request should be accepted
    const first = await request(app)
      .post("/webhooks/yaya")
      .set("YAYA-SIGNATURE", hmac)
      .send(payload);
    expect(first.status).toBe(200);
    expect(first.body.message).toBe("Event received");

    // Second request should be ignored as duplicate
    const second = await request(app)
      .post("/webhooks/yaya")
      .set("YAYA-SIGNATURE", hmac)
      .send(payload);
    expect(second.status).toBe(200);
    expect(second.body.message).toBe("Duplicate ignored");
  });
});
