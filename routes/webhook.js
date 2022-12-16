const express = require("express");
const bodyParser = require("body-parser");
const APS = require("forge-apis");
const {
  authRefreshMiddleware,
  getHubs,
  getProjects,
  getProjectContents,
  getItemVersions,
  postWorkitem,
  getInternalToken,
  getItemVersion,
  readFromMongoDB,
  addtoMongoDB,
} = require("../services/aps.js");
const {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  INTERNAL_TOKEN_SCOPES,
  ISSUE_SUBTYPE_ID,
  USER_ID,
  APS_BUCKET_KEY,
  ACTIVITY_ID,
} = require("../config.js");

let router = express.Router();
router.use("/api/webhooks", bodyParser.json());
router.post("/api/webhooks", async function (req, res, next) {
  try {
    let two_legged_token = await getInternalToken();
    let three_legged_token = await getThreeLeggedTokenFromMongoDB(USER_ID);
    let project_id = req.body.payload.project;
    let source_version_urn = req.body.resourceUrn;
    let input_file_urn = await getItemVersion(
      project_id,
      source_version_urn,
      two_legged_token.access_token
    );
    let input_file_name = req.body.payload["custom-metadata"].fileName;
    let output_file_urn = `urn:adsk.objects:os.object:${APS_BUCKET_KEY}/${
      input_file_name.slice(0, -4) + req.body.payload.version
    }.json`;
    let user_Id = req.body.payload.modifiedBy;
    let coordinates_csv_urn = `urn:adsk.objects:os.object:${APS_BUCKET_KEY}/testacciona.csv`;
    let tolerance = 0.1;
    let hub_id = "";
    let inputParamsJson = {
      userId: user_Id,
      versionUrn: source_version_urn,
      projectId: project_id,
      hubId: "",
      tolerance: 0.1,
      token: three_legged_token,
      issueSubTypeId: ISSUE_SUBTYPE_ID,
      fileName: input_file_name,
      outputUrn: output_file_urn,
    };
    postWorkitem(
      ACTIVITY_ID,
      two_legged_token.access_token,
      three_legged_token,
      input_file_urn,
      output_file_urn,
      coordinates_csv_urn,
      inputParamsJson
    );
    res.json("JOB STARTED!");
  } catch (err) {
    next(err);
  }
});

async function getThreeLeggedTokenFromMongoDB(user_Id) {
  let tokenData = await readFromMongoDB(user_Id);
  if (tokenData == "not found!") {
    return undefined;
  } else {
    if (Date.now() >= tokenData.expires_at * 1000) {
      let newInternalAuthClient = new APS.AuthClientThreeLegged(
        APS_CLIENT_ID,
        APS_CLIENT_SECRET,
        APS_CALLBACK_URL,
        INTERNAL_TOKEN_SCOPES
      );
      let refresh_token = tokenData.refresh_token;
      let newTokenData = await newInternalAuthClient.refreshToken({
        refresh_token,
      });
      let newTokenBody = {
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        expires_at: newTokenData.expires_at,
      };
      addtoMongoDB(user_Id, newTokenBody);
      return newTokenData.access_token;
    }
  }
}

module.exports = router;
