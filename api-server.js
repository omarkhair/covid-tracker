const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const authConfig = require("./src/auth_config.json");
const checkJwt = require("./authentication/authenticate");

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
// @ts-ignore
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

// Connect to Database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://test1:test1@cluster0.mqih7.mongodb.net/covid-tracker?retryWrites=true&w=majority";
if (MONGODB_URI)
  mongoose
    .connect(MONGODB_URI)
    // @ts-ignore
    .then((result) => console.log("MongoDB is now connected"))
    .catch((err) => console.log(err));

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const user_routes = require("./api/user");
app.use("/api/user", user_routes);

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
    // @ts-ignore
    user: req.user
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
