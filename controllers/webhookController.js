require("dotenv").config({ path: ".env", quiet: true });
const replayStore = require("../utils/replayStore");

exports.handleWebhook = async (req, res) => {
  try {
    const { id, timestamp, event, createdAt, data } = req.body;

    // Replay protection: check timestamp
    const tolerance = parseInt(process.env.REPLAY_TOLERANCE_SECONDS); 
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > tolerance) {
      return res.status(400).json({ message: "Stale or future-dated event" });
    }

    // Idempotency: check if we've seen this id before
    if (replayStore.has(id)) {
      return res.status(200).json({ message: "Duplicate ignored" });
    }
    replayStore.add(id);

    // ✅ Process asynchronously (simulate real logic)
    console.log("📩 New YaYa event received:", {
      id,
      event,
      timestamp,
      createdAt,
      data,
    });

    // Respond quickly
    res.status(200).json({ message: "Event received" });

    // Example async work
    setImmediate(() => {
      console.log(`🔧 Processing event ${id} in background...`);
    });
  } catch (err) {
    console.error("Error in webhook:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
