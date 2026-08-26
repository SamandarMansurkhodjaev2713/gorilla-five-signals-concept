import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createRunEvidence,
  findFailures,
  median,
  summarize,
} from "./report.mjs";

function createReport({ cls, lcp, performance, tbt }) {
  return {
    audits: {
      "cumulative-layout-shift": { numericValue: cls },
      "largest-contentful-paint": { numericValue: lcp },
      "total-blocking-time": { numericValue: tbt },
    },
    categories: {
      accessibility: { score: 1 },
      "best-practices": { score: 1 },
      performance: { score: performance },
      seo: { score: 1 },
    },
  };
}

describe("Lighthouse report calculations", () => {
  it("GIVEN three unordered values WHEN median is calculated THEN returns the middle value", () => {
    assert.equal(median([3, 1, 2]), 2);
  });

  it("GIVEN three reports WHEN summarized THEN uses per-field medians", () => {
    const reports = [
      createReport({ cls: 0.01, lcp: 2_400, performance: 0.98, tbt: 100 }),
      createReport({ cls: 0.03, lcp: 2_100, performance: 0.96, tbt: 150 }),
      createReport({ cls: 0.02, lcp: 2_300, performance: 0.97, tbt: 125 }),
    ];

    assert.deepEqual(summarize("/uz/", reports), {
      categories: {
        accessibility: 1,
        "best-practices": 1,
        performance: 0.97,
        seo: 1,
      },
      metrics: {
        "cumulative-layout-shift": 0.02,
        "largest-contentful-paint": 2_300,
        "total-blocking-time": 125,
      },
      route: "/uz/",
    });
  });

  it("GIVEN reports WHEN evidence is created THEN preserves every run", () => {
    const reports = [
      createReport({ cls: 0, lcp: 2_100, performance: 0.99, tbt: 0 }),
      createReport({ cls: 0.01, lcp: 2_200, performance: 0.98, tbt: 10 }),
      createReport({ cls: 0.02, lcp: 2_300, performance: 0.97, tbt: 20 }),
    ];

    const evidence = createRunEvidence("/uz/", reports);

    assert.equal(evidence.length, 3);
    assert.equal(evidence[0].run, 1);
    assert.equal(evidence[1].run, 2);
    assert.equal(evidence[2].run, 3);
    assert.equal(evidence[1].metrics["largest-contentful-paint"], 2_200);
  });

  it("GIVEN values equal to thresholds WHEN checked THEN does not fail", () => {
    const failures = findFailures([
      {
        categories: {
          accessibility: 0.95,
          "best-practices": 0.95,
          performance: 0.95,
          seo: 0.95,
        },
        metrics: {
          "cumulative-layout-shift": 0.1,
          "largest-contentful-paint": 2_500,
          "total-blocking-time": 150,
        },
        route: "/uz/",
      },
    ]);

    assert.deepEqual(failures, []);
  });

  it("GIVEN values outside thresholds WHEN checked THEN reports every violation", () => {
    const failures = findFailures([
      {
        categories: {
          accessibility: 1,
          "best-practices": 1,
          performance: 0.94,
          seo: 1,
        },
        metrics: {
          "cumulative-layout-shift": 0.11,
          "largest-contentful-paint": 2_501,
          "total-blocking-time": 151,
        },
        route: "/uz/",
      },
    ]);

    assert.deepEqual(failures, [
      "/uz/ performance: 0.94",
      "/uz/ cumulative-layout-shift: 0.11",
      "/uz/ largest-contentful-paint: 2501",
      "/uz/ total-blocking-time: 151",
    ]);
  });

  it("GIVEN category scores outside zero to one WHEN summarized THEN fails closed", () => {
    const reportsAboveMaximum = [
      createReport({ cls: 0, lcp: 2_100, performance: 1.01, tbt: 0 }),
      createReport({ cls: 0, lcp: 2_100, performance: 1, tbt: 0 }),
      createReport({ cls: 0, lcp: 2_100, performance: 1, tbt: 0 }),
    ];
    const reportsBelowMinimum = [
      createReport({ cls: 0, lcp: 2_100, performance: -0.01, tbt: 0 }),
      createReport({ cls: 0, lcp: 2_100, performance: 1, tbt: 0 }),
      createReport({ cls: 0, lcp: 2_100, performance: 1, tbt: 0 }),
    ];

    assert.throws(
      () => summarize("/uz/", reportsAboveMaximum),
      /score must be at most 1/u,
    );
    assert.throws(
      () => summarize("/uz/", reportsBelowMinimum),
      /score must be a finite non-negative number/u,
    );
  });

  it("GIVEN a runtime Lighthouse error WHEN summarized THEN fails closed", () => {
    const invalidReport = {
      ...createReport({ cls: 0, lcp: 2_100, performance: 1, tbt: 0 }),
      runtimeError: { code: "ERRORED_DOCUMENT_REQUEST" },
    };

    assert.throws(
      () => summarize("/uz/", [invalidReport, invalidReport, invalidReport]),
      /runtimeError must be absent/u,
    );
  });

  it("GIVEN a null numeric metric WHEN summarized THEN fails closed", () => {
    const invalidReport = createReport({
      cls: null,
      lcp: 2_100,
      performance: 1,
      tbt: 0,
    });

    assert.throws(
      () => summarize("/uz/", [invalidReport, invalidReport, invalidReport]),
      /numericValue must be a finite non-negative number/u,
    );
  });

  it("GIVEN a missing numeric metric WHEN summarized THEN fails closed", () => {
    const invalidReport = createReport({
      cls: 0,
      lcp: 2_100,
      performance: 1,
      tbt: 0,
    });
    delete invalidReport.audits["largest-contentful-paint"].numericValue;

    assert.throws(
      () => summarize("/uz/", [invalidReport, invalidReport, invalidReport]),
      /numericValue must be a finite non-negative number/u,
    );
  });

  it("GIVEN non-finite or negative metrics WHEN summarized THEN fails closed", () => {
    for (const invalidValue of [Number.NaN, Number.POSITIVE_INFINITY, -0.01]) {
      const invalidReport = createReport({
        cls: invalidValue,
        lcp: 2_100,
        performance: 1,
        tbt: 0,
      });

      assert.throws(
        () => summarize("/uz/", [invalidReport, invalidReport, invalidReport]),
        /numericValue must be a finite non-negative number/u,
      );
    }
  });

  it("GIVEN a malformed report WHEN summarized THEN fails closed", () => {
    const validReport = createReport({
      cls: 0,
      lcp: 2_100,
      performance: 1,
      tbt: 0,
    });

    assert.throws(
      () => summarize("/uz/", [validReport, null, validReport]),
      /reports\[1\] must be an object/u,
    );
  });

  it("GIVEN fewer than three reports WHEN summarized THEN fails closed", () => {
    const validReport = createReport({
      cls: 0,
      lcp: 2_100,
      performance: 1,
      tbt: 0,
    });

    assert.throws(
      () => summarize("/uz/", [validReport, validReport]),
      /reports must contain exactly 3 entries/u,
    );
  });
});
