import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeDeploymentBase,
  withoutDeploymentBase,
} from "./deployment-base.mjs";

describe("deployment base", () => {
  it("normalizes an unset base to the application root", () => {
    assert.equal(normalizeDeploymentBase(undefined), "");
    assert.equal(normalizeDeploymentBase(""), "");
  });

  it("accepts the project Pages base", () => {
    assert.equal(
      normalizeDeploymentBase("/gorilla-five-signals-concept"),
      "/gorilla-five-signals-concept",
    );
  });

  it("rejects unsafe or nested bases", () => {
    for (const value of ["/", "/nested/path", "/../escape", "relative"]) {
      assert.throws(() => normalizeDeploymentBase(value));
    }
  });

  it("strips only an exact path-segment prefix", () => {
    const base = "/gorilla-five-signals-concept";
    assert.equal(withoutDeploymentBase(`${base}/uz/`, base), "/uz/");
    assert.equal(withoutDeploymentBase(base, base), "/");
    assert.equal(
      withoutDeploymentBase("/gorilla-five-signals-conceptual/uz/", base),
      "/gorilla-five-signals-conceptual/uz/",
    );
  });
});
