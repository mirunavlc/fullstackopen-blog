const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const userExtractor = (request, response, next) => {
  const receivedToken = request.token;
  const receivedUser = jwt.verify(receivedToken, config.SECRET);
  if (!receivedUser.id) {
    request.user = null;
  } else {
    request.user = receivedUser;
  }
  next();
};

module.exports = userExtractor;
