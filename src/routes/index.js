// src/routes/index.js api routes entry point

const express = require("express");

const { version, author } = require("../../package.json");
const router = express.Router();

router.use(`/drive`, require("./api/index"));

router.get("/", (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader("Cache-Control", "no-cache");
  // Send a 200 'OK' response
  res.status(200).json({
    status: "ok",
    author,
    githubUrl: "https://github.com/yuelin-wen/CloudVault-backend",
    version,
  });
});

module.exports = router;
