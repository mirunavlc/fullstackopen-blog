const { expect } = require("expect");
const testHelper = require("./test_helper");
const listHelper = require("../utils/list_helper");

describe("total likes", () => {
  const blogs = testHelper.listWithManyBlogs();
  const listWithOneBlog = listHelper.listWithOneBlog();

  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });

  test("no. of total likes", () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(36);
  });

  test("most liked", () => {
    const result = listHelper.favoriteBlog(blogs);
    const expected = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    };
    expect(result).toEqual(expected);
  });
});
