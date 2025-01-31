// src/routes/api list api

const { File } = require("../../model/file");
const contentType = require("content-type");
const express = require("express");
const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: "5mb",
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return File.isSupportedType(type);
    },
  });

// GET: /drive/files
router.get("/files", require("./get"));

// GET by id /drive/files/:id
router.get("/files/:id", require("./getById"));

// GET by id /drive/files/:id/info
router.get('/files/:id/info', require('./getByIdInfo'));

// POST /drive/files
router.post("/files", rawBody(), require("./post"));

// PUT /drive/files/:_id
router.put("/files/:_id", rawBody(), require("./putById"));

// DELETE /drive/files/:_id
router.delete("/files/:_id", require("./deleteById"));

module.exports = router;
