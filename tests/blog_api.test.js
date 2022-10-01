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
    const blog = helper.listWithOneBlog()[0];
    console.log(blog);
    await api
      .post("/api/blogs")
      .send(blog)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toHaveLength(helper.listWithManyBlogs().length + 1);
  }, 10000);

  test("check retrival of blog by id", async () => {
    const helpBlog = helper.listWithOneBlog()[0];
    const expectedblog = {
      id: helpBlog._id,
      author: helpBlog.author,
      title: helpBlog.title,
      url: helpBlog.url,
      likes: helpBlog.likes,
    };
    await api
      .post("/api/blogs")
      .send(helpBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api
      .get(`/api/blogs/${helpBlog._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body).toEqual(expectedblog);
  }, 10000);

  test("check default value of likes", async () => {
    const helpBlog = helper.listWithOneBlog()[0];
    const noLikesPropBlog = {
      _id: helpBlog._id,
      author: helpBlog.author,
      title: helpBlog.title,
      url: helpBlog.url,
    };

    await api
      .post("/api/blogs")
      .send(noLikesPropBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api
      .get(`/api/blogs/${noLikesPropBlog._id}`)
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
      .send(noTitlePropBlog)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  }, 10000);

  test("check deletion of blog", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const initialNumberOfBlogs = response.body.length;
    const blogToDelete = response.body[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const finalResponse = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const blogsAtEnd = finalResponse.body;

    expect(blogsAtEnd).toHaveLength(initialNumberOfBlogs - 1);

    const contents = blogsAtEnd.map((r) => r.content);

    expect(contents).not.toContain(blogToDelete.content);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
