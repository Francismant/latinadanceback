const express = require("express");
const cookie = require("cookie-parser");

const app = express();

app.use(cookie());

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

const port = 8000;

require("./database");

const routes = require("./routes");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(routes);

// gestion des routes non reconnues
app.use("*", (req, res) => {
  res.status(404).end();
});

app.listen(port, () => {
  console.log(`serveur Node écoutant sur le port ${port}`);
});
