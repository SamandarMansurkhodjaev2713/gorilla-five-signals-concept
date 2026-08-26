import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const CONTENT_DIRECTORY = path.resolve("src/content");
const COLLECTIONS = [
  "culture",
  "faqs",
  "flavors",
  "legal",
  "media",
  "products",
  "sources",
  "stores",
];

async function loadCollection(name) {
  const directory = path.join(CONTENT_DIRECTORY, name);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith(".json"),
  );
  const records = await Promise.all(
    files.map(async (entry) => {
      const file = path.join(directory, entry.name);
      return { file, record: JSON.parse(await readFile(file, "utf8")) };
    }),
  );
  return [name, records];
}

function identitySet(items, field, failures, collection) {
  const identities = new Set();
  for (const { file, record } of items) {
    const identity = record[field];
    if (typeof identity !== "string") {
      failures.push(`${path.basename(file)}: missing ${field}`);
      continue;
    }
    if (identities.has(identity)) {
      failures.push(`${collection}: duplicate ${field} "${identity}"`);
    }
    identities.add(identity);
  }
  return identities;
}

function verifyReferences(values, targets, context, failures) {
  for (const value of values) {
    if (typeof value !== "string" || !targets.has(value)) {
      failures.push(`${context}: unresolved reference "${String(value)}"`);
    }
  }
}

function arrayField(value) {
  return Array.isArray(value) ? value : [];
}

function nestedValues(items, field) {
  return arrayField(items).map((item) =>
    typeof item === "object" && item !== null ? item[field] : undefined,
  );
}

function verifyProducts(products, sources, media, failures) {
  for (const { file, record } of products) {
    const context = path.basename(file);
    verifyReferences(
      [record.canMediaId, record.posterMediaId],
      media,
      context,
      failures,
    );
    verifyReferences(
      [
        record.sourceId,
        ...nestedValues(record.claims, "sourceId"),
        ...nestedValues(record.warnings, "sourceId"),
      ],
      sources,
      context,
      failures,
    );
  }
}

function verifySupportingContent(collections, identities, failures) {
  for (const { file, record } of collections.flavors) {
    verifyReferences(
      [record.productSlug],
      identities.products,
      path.basename(file),
      failures,
    );
  }
  for (const { file, record } of collections.faqs) {
    verifyReferences(
      arrayField(record.sourceIds),
      identities.sources,
      path.basename(file),
      failures,
    );
  }
  for (const { file, record } of collections.legal) {
    verifyReferences(
      [record.sourceId],
      identities.sources,
      path.basename(file),
      failures,
    );
  }
  for (const { file, record } of collections.culture) {
    verifyReferences(
      arrayField(record.mediaIds),
      identities.media,
      path.basename(file),
      failures,
    );
  }
}

const entries = await Promise.all(COLLECTIONS.map(loadCollection));
const collections = Object.fromEntries(entries);
const failures = [];
const identities = {
  media: identitySet(collections.media, "mediaId", failures, "media"),
  products: identitySet(collections.products, "slug", failures, "products"),
  sources: identitySet(collections.sources, "sourceId", failures, "sources"),
};

verifyProducts(
  collections.products,
  identities.sources,
  identities.media,
  failures,
);
verifySupportingContent(collections, identities, failures);

if (failures.length > 0) {
  process.stderr.write(`Content integrity failures:\n${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  const total = Object.values(collections).reduce(
    (count, collection) => count + collection.length,
    0,
  );
  process.stdout.write(
    `Verified references across ${total} content record(s).\n`,
  );
}
