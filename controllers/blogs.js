const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id);

    if (blog) {
      response.json(blog);
    } else {
      response.status(404).end();
    }
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.delete("/:id", async (request, response, next) => {
  try {
    const blog = await Blog.findByIdAndRemove(request.params.id);
    if (blog) {
      response.status(204).end();
    } else {
      response.status(404).end();
    }
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.put("/:id", async (request, response, next) => {
  try {
    const blog = request.body;
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    });
    response.json(updatedBlog);
  } catch (exception) {
    next(exception);
  }
});

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body;
    const token = getTokenFrom(request);
    const decodedToken = jwt.verify(token, config.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token missing or invalid" });
    }

    const user = await User.findById(decodedToken.id);
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user.id,
    });
    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
  } catch (exception) {
    next(exception);
  }
});

module.exports = blogsRouter;
