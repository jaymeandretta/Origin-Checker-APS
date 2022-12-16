const express = require("express");
const bodyParser = require('body-parser');
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
const {
  APS_BUCKET_KEY,
  ACTIVITY_ID
} = require("../config.js");

let router = express.Router();
router.use("/api/webhooks", bodyParser.json());
router.post("/api/webhooks", async function (req, res, next) {
  try {
    let two_legged_token = await getInternalToken();
    let three_legged_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOndyaXRlIiwiZGF0YTpjcmVhdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6cmVhZCIsImJ1Y2tldDp1cGRhdGUiLCJidWNrZXQ6ZGVsZXRlIiwiYnVja2V0OmNyZWF0ZSIsImNvZGU6YWxsIiwidmlld2FibGVzOnJlYWQiXSwiY2xpZW50X2lkIjoiMVN0UWVHdVkxWm5Db3lWS0JNR3hSU3I2THpXU3lVMzEiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiV2dmcktsRDVUMkhSU2thWHlLQThpWnBEWGUxZ01aeVVFMldpWHJWQXgyUDRoWmUxcnRRVEhmNmNNdjBydjlDRiIsInVzZXJpZCI6Ilk4UUJKOTJURlhLQiIsImV4cCI6MTY3MTE5Mjc4NX0.fEKqmOz4mG2Sp1rZxU8MTdO4jq9VgjcoZnGaveAOF9l_Vv4h9ORuIb_l0t026OaRC9HlD6w-cxMAafd5CXzJRGD-4JnNcdjB4tr2Id08m4pa2GSHdHoDBj4UoezeijfWP8qlON0n7FdQf5aS1ReD-FJ49aRjVkSVMPwkajFuVGGS7RQ3d_fBmJp2MQQaMIr6tjkvopASsjdWpcLGv6eKwooDCtGjvjlevUVtnJtvLV3oBzQBDYDjAPakbuT6cN2cfbCdqUv8MMO3nrPDwkQU5e3OX-_Ks7Zivnj2gKkqD_unfqp9JSupFBZGJAv6po4v5sAHlUkBeZO0Do2D0t7pFw';
    let project_id = req.body.payload.project;
    let source_version_urn = req.body.resourceUrn;
    let input_file_urn = await getItemVersion(project_id, source_version_urn, two_legged_token.access_token);
    let input_file_name = req.body.payload['custom-metadata'].fileName;
    let output_file_urn = `urn:adsk.objects:os.object:${APS_BUCKET_KEY}/${input_file_name.slice(0, -4) + req.body.payload.version}.json`;
    let user_Id = req.body.payload.modifiedBy;
    let coordinates_csv_urn = `urn:adsk.objects:os.object:${APS_BUCKET_KEY}/testacciona.csv`;
    let tolerance = 0.1;
    let hub_id = '';
    let inputParamsJson = {
      userId: user_Id,
      versionUrn: source_version_urn,
      projectId: project_id,
      hubId: "",
      tolerance: 0.1,
      token: three_legged_token,
      issueSubTypeId: "a68bda16-f3fe-4a0c-926b-2c8ef7580374",
      fileName: input_file_name,
      outputUrn: output_file_urn
    }
    postWorkitem(ACTIVITY_ID, two_legged_token.access_token, three_legged_token, input_file_urn, output_file_urn, coordinates_csv_urn, inputParamsJson);
    res.json('JOB STARTED!');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
