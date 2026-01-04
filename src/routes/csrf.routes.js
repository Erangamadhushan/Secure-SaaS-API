const express = require("express");
const csrfProtection = require("../middlewares/csrf.middleware.js");
const { protect } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get("/", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;