const express = require("express");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const errorHandler = require("./middleware/error");

app.use(cors());
app.use(express.json());
app.use("/api/blogs/", blogsRouter);

app.use(errorHandler);

module.exports = app;
