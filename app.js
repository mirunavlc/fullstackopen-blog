const express = require("express");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const errorHandler = require("./middleware/error");
const tokenExtractor = require("./middleware/auth_token");
const userExtractor = require("./middleware/auth_user");

app.use(cors());
app.use(express.json());
app.use(tokenExtractor);
app.use("/api/blogs/", userExtractor, blogsRouter);
app.use("/api/users/", usersRouter);
app.use("/api/login/", loginRouter);

app.use(errorHandler);

module.exports = app;
