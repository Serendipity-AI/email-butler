import { suggest } from "../index";
test("My Greeter", () => {
  const result = (suggest("test@gnail.com") || { full: "" }).full;
  expect(result).toBe("test@gmail.com");
});
