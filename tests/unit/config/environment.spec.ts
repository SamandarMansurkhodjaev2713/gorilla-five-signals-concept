import { describe, expect, it } from "vitest";

import { parsePublicEnvironment } from "@/config/environment";

describe("parsePublicEnvironment", () => {
  it("GIVEN no public values WHEN parsed THEN safe defaults are returned", () => {
    expect(parsePublicEnvironment({})).toEqual({
      defaultLocale: "uz",
      releaseMode: "private",
    });
  });

  it("GIVEN an empty origin WHEN parsed THEN canonical output stays disabled", () => {
    expect(
      parsePublicEnvironment({
        PUBLIC_DEFAULT_LOCALE: "ru",
        PUBLIC_SITE_ORIGIN: "",
      }),
    ).toEqual({
      defaultLocale: "ru",
      releaseMode: "private",
    });
  });

  it("GIVEN a valid origin WHEN parsed THEN it is normalized", () => {
    expect(
      parsePublicEnvironment({
        PUBLIC_SITE_ORIGIN: "https://concept.example.com/",
      }),
    ).toEqual({
      defaultLocale: "uz",
      releaseMode: "private",
      siteOrigin: "https://concept.example.com",
    });
  });

  it("GIVEN a safe project base WHEN parsed THEN it is preserved", () => {
    expect(
      parsePublicEnvironment({
        PUBLIC_BASE_PATH: "/gorilla-five-signals-concept",
      }),
    ).toEqual({
      basePath: "/gorilla-five-signals-concept",
      defaultLocale: "uz",
      releaseMode: "private",
    });
  });

  it.each([
    "/",
    "/nested/path",
    "/../escape",
    "/trailing-",
    "/trailing.",
    "relative",
  ])(
    "GIVEN an unsafe project base %s WHEN parsed THEN validation fails",
    (basePath) => {
      expect(() =>
        parsePublicEnvironment({ PUBLIC_BASE_PATH: basePath }),
      ).toThrow(/PUBLIC_BASE_PATH/u);
    },
  );

  it("GIVEN an unsupported locale WHEN parsed THEN validation fails", () => {
    expect(() =>
      parsePublicEnvironment({ PUBLIC_DEFAULT_LOCALE: "de" }),
    ).toThrow();
  });

  it("GIVEN a relative origin WHEN parsed THEN validation fails", () => {
    expect(() =>
      parsePublicEnvironment({ PUBLIC_SITE_ORIGIN: "/preview" }),
    ).toThrow();
  });

  it("GIVEN public release mode without an origin WHEN parsed THEN validation fails", () => {
    expect(() =>
      parsePublicEnvironment({ PUBLIC_RELEASE_MODE: "public" }),
    ).toThrow(/PUBLIC_SITE_ORIGIN is required/u);
  });

  it("GIVEN a public HTTP origin WHEN parsed THEN validation fails", () => {
    expect(() =>
      parsePublicEnvironment({
        PUBLIC_RELEASE_MODE: "public",
        PUBLIC_SITE_ORIGIN: "http://concept.example.com",
      }),
    ).toThrow(/must use HTTPS/u);
  });

  it.each([
    "https://localhost",
    "https://preview.localhost",
    "https://127.0.0.1",
  ])(
    "GIVEN a public loopback origin %s WHEN parsed THEN validation fails",
    (siteOrigin) => {
      expect(() =>
        parsePublicEnvironment({
          PUBLIC_RELEASE_MODE: "public",
          PUBLIC_SITE_ORIGIN: siteOrigin,
        }),
      ).toThrow(/loopback host/u);
    },
  );

  it("GIVEN a private localhost origin WHEN parsed THEN local preview remains supported", () => {
    expect(
      parsePublicEnvironment({
        PUBLIC_RELEASE_MODE: "private",
        PUBLIC_SITE_ORIGIN: "http://127.0.0.1:4321",
      }),
    ).toEqual({
      defaultLocale: "uz",
      releaseMode: "private",
      siteOrigin: "http://127.0.0.1:4321",
    });
  });

  it.each([
    "https://user:password@concept.example.com",
    "https://concept.example.com/preview",
    "https://concept.example.com?campaign=launch",
    "https://concept.example.com#top",
    "ftp://concept.example.com",
  ])(
    "GIVEN a non-origin URL %s WHEN parsed THEN validation fails",
    (siteOrigin) => {
      expect(() =>
        parsePublicEnvironment({ PUBLIC_SITE_ORIGIN: siteOrigin }),
      ).toThrow();
    },
  );

  it("GIVEN a public HTTPS origin WHEN parsed THEN the release is accepted", () => {
    expect(
      parsePublicEnvironment({
        PUBLIC_RELEASE_MODE: "public",
        PUBLIC_SITE_ORIGIN: "https://concept.example.com",
      }),
    ).toEqual({
      defaultLocale: "uz",
      releaseMode: "public",
      siteOrigin: "https://concept.example.com",
    });
  });
});
