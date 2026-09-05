const express = require("express");
const router  = express.Router();
const { getMyDocuments, getDocumentTypes, submitDocumentRequest } = require("./documentsController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);

router.get("/types", getDocumentTypes);       // list supported document types
router.get("/",      getMyDocuments);          // request history
router.post("/",     submitDocumentRequest);   // submit new request

module.exports = router;
