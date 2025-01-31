// src/routes/api list api

const express = require('express');
const router = express.Router();

// GET: /drive/files
router.get('/files', require('./get'));

// GET by id /drive/files/:id

// POST /drive/files

// PUT /drive/files/:id

// DELETE /drive/files/:id

// login by aws cognito

// sign up by aws cognito

module.exports = router;