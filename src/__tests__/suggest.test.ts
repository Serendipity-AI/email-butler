import { suggest } from "../index";

const suggestWithOptions = (email: string) =>
  suggest(email, {
    domains: ["testdomain.org"],
  });

test("Email suggestion", () => {
  expect(suggest("test@gnail.com")).toEqual({ address: "test", domain: "gmail.com", full: "test@gmail.com" });
});

test("No suggestion", () => {
  expect(suggest("test@gmail.com")).toBe(undefined);
});

test("Other top domain", () => {
  expect(suggest("test@gnail.se")).toEqual({ address: "test", domain: "gmail.se", full: "test@gmail.se" });
});

test("Override domains", () => {
  expect(suggestWithOptions("test@testdomian.org")).toEqual({
    address: "test",
    domain: "testdomain.org",
    full: "test@testdomain.org",
  });
});
