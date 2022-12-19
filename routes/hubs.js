const express = require("express");
const {
  authRefreshMiddleware,
  getHubs,
  getProjects,
  getProjectContents,
  getItemVersions,
  getVersionName,
  getJSONFromFile,
  getInternalToken
} = require("../services/aps.js");

let router = express.Router();

router.use("/api/hubs", authRefreshMiddleware);

router.get("/api/hubs", async function (req, res, next) {
  try {
    const hubs = await getHubs(req.internalOAuthToken);
    res.json(hubs);
  } catch (err) {
    next(err);
  }
});

router.get("/api/hubs/:hub_id/projects", async function (req, res, next) {
  try {
    const projects = await getProjects(
      req.params.hub_id,
      req.internalOAuthToken
    );
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/api/hubs/:hub_id/projects/:project_id/contents",
  async function (req, res, next) {
    try {
      const contents = await getProjectContents(
        req.params.hub_id,
        req.params.project_id,
        req.query.folder_id,
        req.internalOAuthToken
      );
      res.json(contents);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/api/hubs/:hub_id/projects/:project_id/contents/:item_id/versions",
  async function (req, res, next) {
    try {
      const versions = await getItemVersions(
        req.params.project_id,
        req.params.item_id,
        req.internalOAuthToken
      );
      res.json(versions);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/api/hubs/projects/:project_id/versions/:version_urn",
  async function (req, res, next) {
    try {
      const versionInfo = await getVersionName(req.params.project_id, req.params.version_urn + `?version=${req.query.version}`, req.internalOAuthToken);
      let outputFileName = `${versionInfo.attributes.displayName.slice(0, -4) + versionInfo.attributes.versionNumber}`;
      res.json({ modelName: outputFileName })
    } catch (err) {
      next(err);
    }
  }
);

router.get("/api/hubs/models",
  async function (req, res, next) {
    try {
      let two_legged_token = await getInternalToken();
      const modelJSONData = await getJSONFromFile(req.query.model_name + '.json', two_legged_token.access_token)
    } catch (err) {
      next(err);
    }
  }
)

module.exports = router;
