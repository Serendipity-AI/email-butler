import { suggest } from "../index";
test("Email suggestion", () => {
  const result = (suggest("test@gnail.com") || { full: "" }).full;
  expect(result).toBe("test@gmail.com");
});
