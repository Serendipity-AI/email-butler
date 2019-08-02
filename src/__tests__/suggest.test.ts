import { suggest } from "../index";

const suggestWithOptions = (email: string) =>
  suggest(email, {
    domains: ["testdomain.org"],
    secondLevelDomains: [],
    topLevelDomains: [],
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

test("MSN", () => {
  expect(suggest("test@msn.com")).toBe(undefined);
});

test("Invalid email", () => {
  expect(suggest("test@gmail")).toBe(undefined);
});

test("Short email domain", () => {
  expect(suggest("test@ubs.com")).toBe(undefined);
});

test("Override domains", () => {
  expect(suggestWithOptions("test@testdomian.org")).toEqual({
    address: "test",
    domain: "testdomain.org",
    full: "test@testdomain.org",
  });
});

test("Override domain with old domain", () => {
  expect(suggestWithOptions("test@gnail.com")).toBe(undefined);
});
