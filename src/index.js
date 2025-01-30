// src/index.js  main entry
const express = require("express");
const stoppable = require("stoppable");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const app = express();

require("dotenv").config(); // read env file

// middlewares
app.use(helmet()); // Use security middleware
app.use(cors()); // Use CORS middleware so we can make requests across origins
app.use(compression()); // Use gzip/deflate compression middleware

// routes
app.use('/', require('./routes'));

// 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    error: {
      message: "not found",
      code: 404,
    },
  });
});

// port number 8080
const port = parseInt(process.env.PORT || 8080, 10);

stoppable(
  app.listen(port, () => {
    console.log("listening on port ", port);
  })
);
