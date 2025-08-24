require("dotenv").config({ path: ".env", quiet: true });
const crypto = require("crypto");

module.exports = function verifySignature(req, res, next) {
  try {
    const signature = req.get("YAYA-SIGNATURE");
    if (!signature)
      return res.status(401).json({ message: "Missing signature" });

    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) throw new Error("WEBHOOK_SECRET not set");

    function flatten(obj) {
      return Object.keys(obj)
        .sort()
        .map((key) =>
          typeof obj[key] === "object" ? JSON.stringify(obj[key]) : obj[key]
        )
        .join("");
    }

    const flat = flatten(req.body);

    const hmac = crypto
      .createHmac("sha256", secret)
      .update(flat, "utf8")
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "hex");
    const hmacBuffer = Buffer.from(hmac, "hex");

    // Check length first to avoid timingSafeEqual errors
    if (signatureBuffer.length !== hmacBuffer.length) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const valid = crypto.timingSafeEqual(signatureBuffer, hmacBuffer);
    if (!valid) return res.status(401).json({ message: "Invalid signature" });

    next();
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
