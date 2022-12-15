const express = require("express");
// const { webhookMiddleware } = require("../services/aps.js");
const bodyParser = require("body-parser");
let router = express.Router();
router.use("/api/webhooks", bodyParser.json());
router.post("/api/webhooks", async function (req, res, next) {
  try {
    res.json(req);
    let projectId = req.body.payload.project;
    let userID = req.body.payload.user_info.id;
    let versionUrn = req.body.payload.source;
  } catch (err) {
    next(err);
  }
});

function importExcel(
  inputRvtS3Url,
  inputExcS3Url,
  inputJson,
  outputRvtS3Url,
  projectId,
  createVersionBody,
  access_token_3Legged,
  access_token_2Legged
) {
  return new Promise(function (resolve, reject) {
    const workitemBody = {
      activityId:
        designAutomation.nickname +
        "." +
        designAutomation.activity_name +
        "+" +
        designAutomation.appbundle_activity_alias,
      arguments: {
        inputFile: {
          url: inputRvtS3Url,
          headers: {
            Authorization: "Bearer " + access_token_3Legged.access_token,
          },
        },
        inputJson: {
          url: "data:application/json," + JSON.stringify(inputJson),
        },
        inputXls: {
          url: inputExcS3Url,
          headers: {
            Authorization: "Bearer " + access_token_2Legged.access_token,
          },
        },

        outputRvt: {
          verb: "put",
          url: outputRvtS3Url,
          headers: {
            Authorization: "Bearer " + access_token_3Legged.access_token,
          },
        },
        onComplete: {
          verb: "post",
          url: designAutomation.webhook_url,
        },
      },
    };

    var options = {
      method: "POST",
      url: designAutomation.endpoint + "workitems",
      headers: {
        Authorization: "Bearer " + access_token_2Legged.access_token,
        "Content-Type": "application/json",
      },
      body: workitemBody,
      json: true,
    };

    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        let resp;
        try {
          resp = JSON.parse(body);
        } catch (e) {
          resp = body;
        }
        workitemList.push({
          workitemId: resp.id,
          projectId: projectId,
          createVersionData: createVersionBody,
          access_token_3Legged: access_token_3Legged,
        });

        if (response.statusCode >= 400) {
          console.log(
            "error code: " +
              response.statusCode +
              " response message: " +
              response.statusMessage
          );
          reject({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
          });
        } else {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: resp,
          });
        }
      }
    });
  });
}

module.exports = router;
