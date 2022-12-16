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