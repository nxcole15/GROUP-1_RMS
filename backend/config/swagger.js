const swaggerUi = require("swagger-ui-express");
const yaml      = require("js-yaml");
const fs        = require("fs");
const path      = require("path");

let swaggerDocument;
try {
  swaggerDocument = yaml.load(
    fs.readFileSync(path.join(__dirname, "../swagger.yml"), "utf8")
  );
} catch (err) {
  console.error("⚠️  Failed to load swagger.yml:", err.message);
  swaggerDocument = { openapi: "3.0.0", info: { title: "RMS API", version: "1.0.0" }, paths: {} };
}

module.exports = { swaggerUi, swaggerDocument };
