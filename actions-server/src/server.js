const express = require("express");
const bodyParser = require("body-parser");
const Sentry = require("@sentry/node");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

Sentry.init({
  dsn:
    "https://593a557ed4834276803af5fc8a4432b5@o392843.ingest.sentry.io/5241108",
});

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/:route", (req, res) => {
  try {
    const handler = require(`./handlers/${req.params.route}`);
    if (!handler) {
      return res.status(404).json({
        message: `not found`,
      });
    }
    return handler(req, res);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "unexpected error occured",
    });
  }
});

app.listen(PORT);
