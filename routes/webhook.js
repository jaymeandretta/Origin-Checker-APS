const express = require("express");
const { authRefreshMiddleware } = require("../services/aps.js");

let router = express.Router();
router.use("/api/webhooks", authRefreshMiddleware);

router.post("/api/webhooks", async function (req, res, next) {
  try {
    res.json(req);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
