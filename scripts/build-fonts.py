from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PACKAGE_ROOT = PROJECT_ROOT / "node_modules" / "@fontsource-variable"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "fonts"
FONT_SOURCE_VERSION = "5.3.0"
OWNED_OUTPUT_DIRECTORIES = ("licenses", "onest", "oswald", "unbounded")
FONT_ARTIFACTS = (
    (
        "oswald",
        "files/oswald-latin-wght-normal.woff2",
        "oswald/oswald-latin-variable.woff2",
    ),
    (
        "oswald",
        "files/oswald-cyrillic-wght-normal.woff2",
        "oswald/oswald-cyrillic-variable.woff2",
    ),
    (
        "onest",
        "files/onest-latin-wght-normal.woff2",
        "onest/onest-latin-variable.woff2",
    ),
    (
        "onest",
        "files/onest-cyrillic-wght-normal.woff2",
        "onest/onest-cyrillic-variable.woff2",
    ),
)
LICENSE_ARTIFACTS = (
    ("oswald", "LICENSE", "licenses/Oswald-OFL.txt"),
    ("onest", "LICENSE", "licenses/Onest-OFL.txt"),
)


def package_directory(family: str) -> Path:
    return PACKAGE_ROOT / family


def verify_package_version(family: str) -> None:
    metadata_path = package_directory(family) / "package.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("version") != FONT_SOURCE_VERSION:
        raise RuntimeError(
            f"Expected {family} {FONT_SOURCE_VERSION}, got {metadata.get('version')}."
        )


def reset_owned_outputs() -> None:
    for directory_name in OWNED_OUTPUT_DIRECTORIES:
        shutil.rmtree(OUTPUT_ROOT / directory_name, ignore_errors=True)
    (OUTPUT_ROOT / "font-manifest.json").unlink(missing_ok=True)


def copy_artifact(family: str, source_name: str, output_name: str) -> dict[str, object]:
    source = package_directory(family) / source_name
    output = OUTPUT_ROOT / output_name
    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, output)
    contents = output.read_bytes()
    return {
        "bytes": len(contents),
        "family": family,
        "output": output_name,
        "sha256": hashlib.sha256(contents).hexdigest(),
        "source": source_name,
        "version": FONT_SOURCE_VERSION,
    }


def write_manifest(artifacts: list[dict[str, object]]) -> None:
    manifest = {
        "artifacts": sorted(artifacts, key=lambda item: str(item["output"])),
        "generator": "scripts/build-fonts.py",
        "schemaVersion": 1,
    }
    output = OUTPUT_ROOT / "font-manifest.json"
    output.write_text(
        f"{json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True)}\n",
        encoding="utf-8",
        newline="\n",
    )


def main() -> None:
    for family in ("onest", "oswald"):
        verify_package_version(family)
    reset_owned_outputs()
    artifacts = [copy_artifact(*artifact) for artifact in FONT_ARTIFACTS]
    artifacts.extend(copy_artifact(*artifact) for artifact in LICENSE_ARTIFACTS)
    write_manifest(artifacts)
    for artifact in sorted(artifacts, key=lambda item: str(item["output"])):
        print(f"public/fonts/{artifact['output']}: {artifact['bytes']} bytes")


if __name__ == "__main__":
    main()
