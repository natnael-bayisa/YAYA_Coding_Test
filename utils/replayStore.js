
const seen = new Map();
const TTL = 600; // 10 minutes

function cleanup() {
  const now = Date.now() / 1000;
  for (let [id, ts] of seen) {
    if (now - ts > TTL) {
      seen.delete(id);
    }
  }
}

module.exports = {
  has(id) {
    cleanup();
    return seen.has(id);
  },
  add(id) {
    seen.set(id, Date.now() / 1000);
  },
};
