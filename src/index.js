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
      message: "route not found",
      code: 404,
    },
  });
});

app.use((err, req, res, next) => {
  // We may already have an error response we can use, but if not, use a generic
  // 500 server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

// port number 8080
const port = parseInt(process.env.PORT || 8080, 10);

stoppable(
  app.listen(port, () => {
    console.log("listening on port ", port, ", url : http://localhost:8080");
  })
);
