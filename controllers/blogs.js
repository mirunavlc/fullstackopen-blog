const blogsRouter = require("express").Router();
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
    const blogToBeDeleted = await Blog.findById(request.params.id);
    const confirmationUserId = blogToBeDeleted.user.toString();
    const user = await User.findOne({ username: request.user.username });

    if (user.id === confirmationUserId) {
      const deletedBlog = await Blog.findByIdAndRemove(blogToBeDeleted.id);
      user.blogs = user.blogs.filter((blog) => blog !== blog.id);
      user.save();
      response.status(deletedBlog ? 204 : 404).end();
    } else {
      response.status(401).end();
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

blogsRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body;
    const user = await User.findOne({ username: request.user.username });
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
    if (exception.name === "SyntaxError") exception.name = "JsonWebTokenError";
    next(exception);
  }
});

module.exports = blogsRouter;
