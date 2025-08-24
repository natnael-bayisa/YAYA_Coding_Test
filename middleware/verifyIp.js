const ipRangeCheck = require("ip-range-check");

module.exports = function verifyIp(req, res, next) {
  const trusted = (process.env.TRUSTED_YAYA_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (trusted.length === 0) {
    return next(); // no restriction
  }

  const requestIp =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;

  const allowed = trusted.some((range) => ipRangeCheck(requestIp, range));
  if (!allowed) {
    return res.status(403).json({ message: "Forbidden: untrusted IP" });
  }

  next();
};
