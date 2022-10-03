const mongoose = require("mongoose");
const config = require("../utils/config");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  url: String,
  likes: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
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
