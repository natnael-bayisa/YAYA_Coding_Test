const seen = new Map();

//Time To Live
`
If an event ID is re-sent within 10 minutes, it will be considered a duplicate (Duplicate ignored).
If it's re-sent after 10 minutes, it will be treated as a new event because the old ID has expired.
`
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
