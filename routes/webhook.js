const express = require("express");
const bodyParser = require("body-parser");
const {
  authRefreshMiddleware,
  getHubs,
  getProjects,
  getProjectContents,
  getItemVersions,
  postWorkitem,
  getInternalToken,
  getItemVersion,
} = require("../services/aps.js");
const { APS_BUCKET_KEY, ACTIVITY_ID } = require("../config.js");

let router = express.Router();
router.use("/api/webhooks", bodyParser.json());
router.post("/api/webhooks", async function (req, res, next) {
  try {
    let two_legged_token = await getInternalToken();
    let three_legged_token =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOndyaXRlIiwiZGF0YTpjcmVhdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6cmVhZCIsImJ1Y2tldDp1cGRhdGUiLCJidWNrZXQ6ZGVsZXRlIiwiYnVja2V0OmNyZWF0ZSIsImNvZGU6YWxsIiwidmlld2FibGVzOnJlYWQiXSwiY2xpZW50X2lkIjoiOXFHMjFRbkZVSW53NE94cUtQZ1d5RnV0NmQ4d3FNcm8iLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoibUthYnhlZU5nS2J0amFQSGRBYzhLZENMbzF6Qm9UUUJFaWNMZnBJeUZFeUJHeGhYTmhPNlVRSXdUNXZQRTkyaSIsInVzZXJpZCI6IjRaNkpCNkFDUllXTEQ5QUsiLCJleHAiOjE2NzEyMDMyMDB9.A-y3SV3QeUuuriyy9756DdvTezlUJsKMEtmS9JO6yDvwSrfv09xQryaO9EquIgdzAljTOQB8ELJbOj87GIaBePx7wMGMrNTkex25NpHiwQs44tQAYdYf2qTc9BtvtnWcC8VBmEkuzVk11Z0mp6DtprO5Wqg8j8bcMUnmQSY3rHb3NLhsPukO1FuJugwfV3VYbLPKgGt8DjrKohmPZwNTFAfQ-DefBPkRTH7RW6P8vNb7JxbEIcU0aQTSsOeilT8qf7rIXEQ21aZCilL9iSl5r34varNf6BehM0tuoAlmsG9G4dzfom2JZHwVmVvuLI1P5JPDsIuz72627ogzyob3WQ";
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
    let coordinates_csv_urn = `urn:adsk.objects:os.object:${APS_BUCKET_KEY}/TabelaOrigens.csv`;
    let tolerance = 0.1;
    let hub_id = "";
    let inputParamsJson = {
      userId: user_Id,
      versionUrn: source_version_urn,
      projectId: project_id,
      hubId: "",
      tolerance: 0.1,
      token: three_legged_token,
      issueSubTypeId: "5a297e94-0a20-41d4-919c-1cb5dfe0bb96",
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

module.exports = router;
