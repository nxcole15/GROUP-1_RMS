const swaggerUi = require("swagger-ui-express");
const yaml      = require("js-yaml");
const fs        = require("fs");
const path      = require("path");

const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "../swagger.yml"), "utf8")
);

module.exports = { swaggerUi, swaggerDocument };
