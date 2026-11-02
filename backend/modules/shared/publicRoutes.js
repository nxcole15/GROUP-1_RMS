/**
 * modules/shared/publicRoutes.js
 * Public routes that don't require authentication
 */
const express = require("express");
const router = express.Router();
const { getAcademicConfig } = require("./publicController");

// Public route - no authentication required
router.get("/academic-config", getAcademicConfig);

module.exports = router;
