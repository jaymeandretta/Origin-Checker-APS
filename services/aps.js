const APS = require("forge-apis");
const {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  INTERNAL_TOKEN_SCOPES,
  PUBLIC_TOKEN_SCOPES,
  MONGO_CONN_STRING,
  MONGO_COLLECTION,
  MONGO_DB,
} = require("../config.js");

var axios = require("axios").default;
const request = require("request");
var MongoClient = require("mongodb").MongoClient;

const internalAuthClient = new APS.AuthClientThreeLegged(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  INTERNAL_TOKEN_SCOPES
);
const publicAuthClient = new APS.AuthClientThreeLegged(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  PUBLIC_TOKEN_SCOPES
);
const internalAuthClient2LO = new APS.AuthClientTwoLegged(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  INTERNAL_TOKEN_SCOPES,
  true
);

const service = (module.exports = {});

service.getAuthorizationUrl = () => internalAuthClient.generateAuthUrl();

service.authCallbackMiddleware = async (req, res, next) => {
  const internalCredentials = await internalAuthClient.getToken(req.query.code);
  const publicCredentials = await publicAuthClient.refreshToken(
    internalCredentials
  );
  req.session.public_token = publicCredentials.access_token;
  req.session.internal_token = internalCredentials.access_token;
  req.session.refresh_token = publicCredentials.refresh_token;
  req.session.expires_at = Date.now() + internalCredentials.expires_in * 1000;
  next();
};

service.webhookMiddleware = async (req, res, next) => {
  next();
};

service.authRefreshMiddleware = async (req, res, next) => {
  const { refresh_token, expires_at } = req.session;
  if (!refresh_token) {
    res.status(401).end();
    return;
  }

  if (expires_at < Date.now()) {
    const internalCredentials = await internalAuthClient.refreshToken({
      refresh_token,
    });
    const publicCredentials = await publicAuthClient.refreshToken(
      internalCredentials
    );
    req.session.public_token = publicCredentials.access_token;
    req.session.internal_token = internalCredentials.access_token;
    req.session.refresh_token = publicCredentials.refresh_token;
    req.session.expires_at = Date.now() + internalCredentials.expires_in * 1000;
  }
  req.internalOAuthToken = {
    access_token: req.session.internal_token,
    expires_in: Math.round((req.session.expires_at - Date.now()) / 1000),
  };
  req.publicOAuthToken = {
    access_token: req.session.public_token,
    expires_in: Math.round((req.session.expires_at - Date.now()) / 1000),
  };
  next();
};

service.getUserProfile = async (token) => {
  const resp = await new APS.UserProfileApi().getUserProfile(
    internalAuthClient,
    token
  );
  return resp.body;
};

service.getHubs = async (token) => {
  const resp = await new APS.HubsApi().getHubs(null, internalAuthClient, token);
  return resp.body.data;
};

service.getProjects = async (hubId, token) => {
  const resp = await new APS.ProjectsApi().getHubProjects(
    hubId,
    null,
    internalAuthClient,
    token
  );
  return resp.body.data;
};

service.getProjectContents = async (hubId, projectId, folderId, token) => {
  if (!folderId) {
    const resp = await new APS.ProjectsApi().getProjectTopFolders(
      hubId,
      projectId,
      internalAuthClient,
      token
    );
    return resp.body.data;
  } else {
    const resp = await new APS.FoldersApi().getFolderContents(
      projectId,
      folderId,
      null,
      internalAuthClient,
      token
    );
    return resp.body.data;
  }
};

service.getItemVersions = async (projectId, itemId, token) => {
  const resp = await new APS.ItemsApi().getItemVersions(
    projectId,
    itemId,
    null,
    internalAuthClient,
    token
  );
  return resp.body.data;
};

service.getItemVersion = async (projectId, versionId, token) => {
  var options = {
    method: "GET",
    url: `https://developer.api.autodesk.com/data/v1/projects/b.${projectId}/versions/${encodeURIComponent(
      versionId
    )}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  let storageUrn = "";
  await axios
    .request(options)
    .then(function (response) {
      storageUrn = response.data.data.relationships.storage.data.id;
      return response.data.data.relationships.storage.data.id;
    })
    .catch(function (error) {
      console.error(error);
    });
  return storageUrn;
};

service.postWorkitem = async (
  activityId,
  two_legged_token,
  three_legged_token,
  input_file_urn,
  output_file_urn,
  coordinates_csv_urn,
  inputParamsJson
) => {
  const workitemBody = {
    activityId: activityId,
    arguments: {
      inputFile: {
        url: input_file_urn,
        verb: "get",
        Headers: {
          Authorization: "Bearer " + three_legged_token,
        },
      },
      coordinates: {
        url: coordinates_csv_urn,
        verb: "get",
        Headers: {
          Authorization: "Bearer " + two_legged_token,
        },
      },
      inputParams: {
        verb: "get",
        url: "data:application/json," + JSON.stringify(inputParamsJson),
      },
      result: {
        verb: "put",
        url: output_file_urn,
        Headers: {
          Authorization: "Bearer " + two_legged_token,
        },
      },
    },
  };

  var options = {
    method: "POST",
    url: "https://developer.api.autodesk.com/da/us-east/v3/workitems",
    headers: {
      Authorization: "Bearer " + two_legged_token,
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
      response;
      console.log(resp);
    }
  });
};

service.getInternalToken = async () => {
  if (!internalAuthClient2LO.isAuthorized()) {
    await internalAuthClient2LO.authenticate();
  }
  return internalAuthClient2LO.getCredentials();
};

service.readFromMongoDB = async (id) => {
  const client = new MongoClient(MONGO_CONN_STRING);
  let result;
  try {
    const db = await client.db(MONGO_DB);
    const collection = await db.collection(MONGO_COLLECTION);
    const findresult = await collection.findOne({ _id: id });
    result = findresult ? findresult : "not found!";
  } finally {
    client.close();
  }
  return result;
};

service.addtoMongoDB = async (dataId, dataBody) => {
  const client = new MongoClient(MONGO_CONN_STRING);
  try {
    const db = await client.db(MONGO_DB);
    const collection = await db.collection(MONGO_COLLECTION);
    const findresult = await collection.findOne({ _id: dataId });
    if (findresult) {
      const filter = { _id: dataId };
      const replaceresult = await collection.replaceOne(filter, dataBody);
    } else {
      dataBody._id = dataId;
      const insertresult = await collection.insertOne(dataBody);
    }
  } finally {
    client.close();
  }
};
