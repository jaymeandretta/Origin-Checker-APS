const express = require("express");
const {
  getAuthorizationUrl,
  authCallbackMiddleware,
  authRefreshMiddleware,
  getUserProfile,
  addtoMongoDB,
} = require("../services/aps.js");

let router = express.Router();

router.get("/api/auth/login", function (req, res) {
  res.redirect(getAuthorizationUrl());
});

router.get("/api/auth/logout", function (req, res) {
  req.session = null;
  res.redirect("/");
});

router.get("/api/auth/callback", authCallbackMiddleware, function (req, res) {
  res.redirect("/");
});

router.get("/api/auth/token", authRefreshMiddleware, function (req, res) {
  res.json(req.publicOAuthToken);
});

router.get(
  "/api/auth/profile",
  authRefreshMiddleware,
  async function (req, res, next) {
    try {
      const profile = await getUserProfile(req.internalOAuthToken);
      let tokenBody = {
        access_token: req.session.internal_token,
        refresh_token: req.session.refresh_token,
        expires_at: req.session.expires_at,
      };
      addtoMongoDB(profile.userId, tokenBody);
      res.json({ name: `${profile.firstName} ${profile.lastName}` });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
