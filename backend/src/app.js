const express = require("express");
const caseRoutes = require("./routes/caseRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/case", caseRoutes);

app.use(errorHandler);

module.exports = app;