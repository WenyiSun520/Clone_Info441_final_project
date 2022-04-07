import express from "express";
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("<h1>Welcome to the assistant application for steel division 2.</h1><p>Visit /api/v1/ for actual API endpoints</p>");
});

export default router;
