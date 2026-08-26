export const CATEGORY_IDS = Object.freeze([
  "performance",
  "accessibility",
  "best-practices",
  "seo",
]);

export const CATEGORY_THRESHOLD = 0.95;

const EXPECTED_REPORT_COUNT = 3;

export const METRIC_THRESHOLDS = Object.freeze({
  "cumulative-layout-shift": 0.1,
  "largest-contentful-paint": 2_500,
  "total-blocking-time": 150,
});

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNonNegativeValue(container, id, field, path) {
  const entry = container[id];
  const value = isRecord(entry) ? entry[field] : undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(
      `${path}.${id}.${field} must be a finite non-negative number`,
    );
  }
  return value;
}

function validateReport(report, reportIndex) {
  const path = `reports[${String(reportIndex)}]`;
  if (!isRecord(report)) {
    throw new TypeError(`${path} must be an object`);
  }
  if (Object.hasOwn(report, "runtimeError")) {
    throw new Error(`${path}.runtimeError must be absent`);
  }
  if (!isRecord(report.categories) || !isRecord(report.audits)) {
    throw new TypeError(`${path} must contain categories and audits objects`);
  }
  for (const id of CATEGORY_IDS) {
    const score = readFiniteNonNegativeValue(
      report.categories,
      id,
      "score",
      `${path}.categories`,
    );
    if (score > 1) {
      throw new RangeError(`${path}.categories.${id}.score must be at most 1`);
    }
  }
  for (const id of Object.keys(METRIC_THRESHOLDS)) {
    readFiniteNonNegativeValue(
      report.audits,
      id,
      "numericValue",
      `${path}.audits`,
    );
  }
}

function validateReports(reports) {
  if (!Array.isArray(reports) || reports.length !== EXPECTED_REPORT_COUNT) {
    throw new RangeError(
      `reports must contain exactly ${String(EXPECTED_REPORT_COUNT)} entries`,
    );
  }
  reports.forEach(validateReport);
}

export function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function getCategories(report) {
  return Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, report.categories[id].score]),
  );
}

function getMetrics(report) {
  return Object.fromEntries(
    Object.keys(METRIC_THRESHOLDS).map((id) => [
      id,
      report.audits[id].numericValue,
    ]),
  );
}

export function summarize(route, reports) {
  validateReports(reports);
  const categories = Object.fromEntries(
    CATEGORY_IDS.map((id) => [
      id,
      median(reports.map((report) => report.categories[id].score)),
    ]),
  );
  const metrics = Object.fromEntries(
    Object.keys(METRIC_THRESHOLDS).map((id) => [
      id,
      median(reports.map((report) => report.audits[id].numericValue)),
    ]),
  );
  return { categories, metrics, route };
}

export function createRunEvidence(route, reports) {
  validateReports(reports);
  return reports.map((report, runIndex) => ({
    categories: getCategories(report),
    metrics: getMetrics(report),
    route,
    run: runIndex + 1,
  }));
}

export function findFailures(summaries) {
  return summaries.flatMap((summary) => {
    const categoryFailures = Object.entries(summary.categories)
      .filter(([, score]) => score < CATEGORY_THRESHOLD)
      .map(([id, score]) => `${summary.route} ${id}: ${score}`);
    const metricFailures = Object.entries(summary.metrics)
      .filter(([id, value]) => value > METRIC_THRESHOLDS[id])
      .map(([id, value]) => `${summary.route} ${id}: ${value}`);
    return [...categoryFailures, ...metricFailures];
  });
}
