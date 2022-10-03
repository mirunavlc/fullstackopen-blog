const { expect } = require("expect");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("./test_helper");

describe("api", () => {
  let token = undefined;
  let userForToken = undefined;

  beforeAll(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();

    userForToken = {
      username: user.username,
      id: user._id,
    };

    token = jwt.sign(userForToken, config.SECRET);
  });

  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObj = helper.listWithManyBlogs().map((blog) => new Blog(blog));
    const promiseArray = blogObj.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("blogs are returned as json", async () => {
    console.log(token);
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveLength(6);
  }, 10000);

  test("id property exists", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body[0].id).toBeDefined();
  }, 10000);

  test("check creation of blog", async () => {
    const blog = helper.listWithOneBlog()[0];
    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveLength(helper.listWithManyBlogs().length + 1);
  }, 10000);

  test("check retrival of blog by id", async () => {
    const helpBlog = helper.listWithOneBlog()[0];

    const createdBlog = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(helpBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const expectedBlog = {
      title: helpBlog.title,
      author: helpBlog.author,
      url: helpBlog.url,
      likes: helpBlog.likes,
      user: userForToken.id,
      id: createdBlog.body.id,
    };
    const response = await api
      .get(`/api/blogs/${createdBlog.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(JSON.stringify(response.body)).toBe(JSON.stringify(expectedBlog));
  }, 10000);

  test("check default value of likes", async () => {
    const helpBlog = helper.listWithOneBlog()[0];
    const noLikesPropBlog = {
      title: helpBlog.title,
      author: helpBlog.author,
      url: helpBlog.url,
      user: userForToken.id,
    };
    const createdBlog = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(noLikesPropBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api
      .get(`/api/blogs/${createdBlog.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.likes).toBe(0);
  }, 10000);

  test("check author validation", async () => {
    const helpBlog = helper.listWithOneBlog()[0];
    const noAuthorPropBlog = {
      _id: helpBlog._id,
      title: helpBlog.title,
      url: helpBlog.url,
      likes: 2,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(noAuthorPropBlog)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  }, 10000);

  test("check title validation", async () => {
    const helpBlog = helper.listWithOneBlog()[0];
    const noTitlePropBlog = {
      _id: helpBlog._id,
      author: helpBlog.author,
      url: helpBlog.url,
      likes: 2,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(noTitlePropBlog)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  }, 10000);

  test("check deletion of blog", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const initialNumberOfBlogs = response.body.length;

    const helpBlog = helper.listWithOneBlog()[0];
    const blogToDelete = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(helpBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    await api
      .delete(`/api/blogs/${blogToDelete.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const finalResponse = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const blogsAtEnd = finalResponse.body;

    expect(blogsAtEnd).toHaveLength(initialNumberOfBlogs);
    expect(blogsAtEnd).not.toContain(blogToDelete);
  }, 10000);

  test("check update of blog", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogToUpdate = response.body[0];
    const updateLikes = { likes: 7 };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateLikes)
      .expect(200);

    const responseUpdated = await api
      .get(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(responseUpdated.body.likes).toBe(updateLikes.likes);
  }, 10000);

  afterAll(() => {
    mongoose.connection.close();
  });
});
