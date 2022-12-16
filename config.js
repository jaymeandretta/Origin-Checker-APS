let {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  SERVER_SESSION_SECRET,
  PORT,
  MONGO_CONN_STRING,
  MONGO_COLLECTION,
  MONGO_DB,
  APS_BUCKET_KEY,
  ACTIVITY_ID
} = process.env;

if (
  !APS_CLIENT_ID ||
  !APS_CLIENT_SECRET ||
  !APS_CALLBACK_URL ||
  !SERVER_SESSION_SECRET
) {
  console.warn("Missing some of the environment variables.");
  process.exit(1);
}

const INTERNAL_TOKEN_SCOPES = ["data:read", "data:write", "data:create", "bucket:read", "bucket:update", "bucket:delete", "bucket:create", "viewables:read", "code:all"];
const PUBLIC_TOKEN_SCOPES = ["viewables:read"];
PORT = PORT || 8080;

module.exports = {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  APS_CALLBACK_URL,
  SERVER_SESSION_SECRET,
  INTERNAL_TOKEN_SCOPES,
  PUBLIC_TOKEN_SCOPES,
  PORT,
  MONGO_CONN_STRING,
  MONGO_COLLECTION,
  MONGO_DB,
  APS_BUCKET_KEY,
  ACTIVITY_ID
};
