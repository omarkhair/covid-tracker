const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");

const app = express();

const port = process.env.SERVER_PORT || 3000;

app.use(morgan("dev"));


app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
var options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
    index: ['index.html'],
    maxAge: '1m',
    redirect: false
  }
app.use(express.static(join(__dirname, "build"), options));

app.listen(port, () => console.log(`Server listening on port ${port}`));