import test from "node:test";
import assert from "node:assert/strict";
import {
  filterApplications,
  validateApplication,
  safeUrl,
  parseApplications,
} from "../src/applications.js";

const first = {
  id: "one",
  company: "Fern",
  role: "React Developer",
  date: "2026-01-02",
  status: "Applied",
  url: "",
  notes: "",
};
const second = {
  ...first,
  id: "two",
  company: "Orbit",
  date: "2026-01-01",
  status: "Offer",
};

test("search and status filters combine without mutating stored order", () => {
  const items = [second, first];
  assert.deepEqual(filterApplications(items, " REACT ", "Applied", "newest"), [
    first,
  ]);
  assert.deepEqual(filterApplications(items, "", "All", "newest"), [
    first,
    second,
  ]);
  assert.equal(items[0], second);
});
test("validation rejects blank fields, impossible dates, future dates and unsafe links", () => {
  assert.deepEqual(validateApplication(first), {});
  const errors = validateApplication({
    ...first,
    company: "  ",
    role: "",
    date: "2026-02-30",
    url: "javascript:alert(1)",
  });
  for (const field of ["company", "role", "date", "url"])
    assert.ok(errors[field]);
  assert.ok(validateApplication({ ...first, date: "9999-01-01" }).date);
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("https://example.com/job"), "https://example.com/job");
});
test("saved data round trips and malformed data is rejected", () => {
  assert.deepEqual(parseApplications(JSON.stringify([first, second])), [
    first,
    second,
  ]);
  assert.throws(() => parseApplications("{}"));
  assert.throws(() => parseApplications(JSON.stringify([first, first])));
  assert.throws(() =>
    parseApplications(JSON.stringify([{ ...first, status: "Invalid" }])),
  );
});
