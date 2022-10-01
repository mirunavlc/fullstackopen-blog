const mongoose = require("mongoose");
const config = require("../utils/config");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

blogSchema.set("toJSON", {
  transform: (doc, returnObj) => {
    returnObj.id = returnObj._id.toString();
    delete returnObj._id;
    delete returnObj.__v;
  },
});

const Blog = mongoose.model("Blog", blogSchema);
const mongoUrl = config.MONGODB_URI;
mongoose.connect(mongoUrl);

module.exports = Blog;
