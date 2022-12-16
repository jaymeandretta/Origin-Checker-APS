const express = require("express");
const session = require("cookie-session");
const cors = require("cors");

const { PORT, SERVER_SESSION_SECRET } = require("./config.js");

let app = express();
app.use(express.static("wwwroot"));
app.use(
  session({ secret: SERVER_SESSION_SECRET, maxAge: 24 * 60 * 60 * 1000 })
);
var corsOptions = {
  origin: "false",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors());
app.use(require("./routes/auth.js"));
app.use(require("./routes/hubs.js"));
app.use(require("./routes/webhook.js"));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));