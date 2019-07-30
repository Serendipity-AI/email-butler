import { validate } from "../index";

test("Valid email", () => {
  expect(validate("test@gmail.com")).toBe(true);
});

test("Invalid email", () => {
  expect(validate("test$gmail.com")).toBe(false);
});
