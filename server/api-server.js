const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const authConfig = require("../auth_config.json");
const checkJwt = require("./authentication/authenticate");

const app = express();
dotenv.config();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
// @ts-ignore
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;


// Connect to Database
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI)
  mongoose
    .connect(MONGODB_URI)
    // @ts-ignore
    .then((result) => console.log("MongoDB is now connected"))
    .catch((err) => console.log(err));

app.use(morgan("dev"));
// @ts-ignore
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
