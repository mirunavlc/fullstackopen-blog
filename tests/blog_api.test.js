const { expect } = require("expect");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);
const Blog = require("../models/blog");
const helper = require("./test_helper");

describe("api", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObj = helper.listWithManyBlogs().map((blog) => new Blog(blog));
    const promiseArray = blogObj.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("blogs are returned as json", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveLength(6);
  }, 10000);

  test("id property exists", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body[0].id).toBeDefined();
  }, 10000);

  test("check creation of blog", async () => {
    await api
      .post("/api/blogs")
      .send(helper.listWithOneBlog[0])
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveLength(helper.listWithManyBlogs().length + 1);
  }, 10000);

  afterAll(() => {
    mongoose.connection.close();
  });
});
