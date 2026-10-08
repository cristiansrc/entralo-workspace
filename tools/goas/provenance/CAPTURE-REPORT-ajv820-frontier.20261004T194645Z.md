# Capture Report — ajv@8.20.0 frontier (4 authorized GETs)

- run_utc: 20261004T194645Z (start) — server `date` per resource below
- Scope: exactly 4 GET (metadata packuments) on `registry.npmjs.org`, one attempt per URL
- Redirects followed: none (`--max-redirs 0`). No `Location` header present in any response.
- Retries / backoff: none. No HEAD, no other endpoint/domain, no tarball download.
- Limits enforced: `--max-time 30` (30 s), `--max-filesize 10485760` (10 MiB/body). No body exceeded.
- Note: this run captured METADATA ONLY. No tarball integrity/authenticity is asserted; `dist.integrity` below is reported as untrusted registry metadata.

## 1. Requests & custody

| # | resource | URL | HTTP | server date (UTC) | bytes | exit |
|---|----------|-----|------|-------------------|-------|------|
| 1 | fast-deep-equal | https://registry.npmjs.org/fast-deep-equal | 200 | 2026-10-04T19:46:45Z | 48634 | 0 |
| 2 | fast-uri | https://registry.npmjs.org/fast-uri | 200 | 2026-10-04T19:46:46Z | 137334 | 0 |
| 3 | json-schema-traverse | https://registry.npmjs.org/json-schema-traverse | 200 | 2026-10-04T19:46:46Z | 23537 | 0 |
| 4 | require-from-string | https://registry.npmjs.org/require-from-string | 200 | 2026-10-04T19:46:46Z | 15128 | 0 |

- Bodies (vendor/metadata/):
  - `npmjs-fast-deep-equal.20261004T194645Z.json` — sha256 `490d6b92e71413bba95d4c6dc9015e3ff974aa56db066cf756310c3bb78b85a2`
  - `npmjs-fast-uri.20261004T194645Z.json` — sha256 `7d999d8c49bad0132be2ac5828b35d560e63f4a9d02b394ca384cbd97fca46eb`
  - `npmjs-json-schema-traverse.20261004T194645Z.json` — sha256 `b9c213075bc26f316fd5a3d9393401cf13a28ca05b26dce2d07b0d007e490d04`
  - `npmjs-require-from-string.20261004T194645Z.json` — sha256 `306a04f6125642e8b422a90fc24033ba250946584d9510175467390773b928b5`
- Response headers (provenance/): `headers-npmjs-<name>.20261004T194645Z.txt`
- Fetch log: `fetch-ajv820-closure.20261004T194645Z.log`
- SHA-256 manifest: `sha256-ajv820-frontier.20261004T194645Z.txt`

## 2. Local analysis — candidate selection (metadata only)

| package | range (literal) | resolved stable candidate | dist-tags.latest | notes |
|---------|-----------------|---------------------------|------------------|-------|
| fast-deep-equal | ^3.1.3 | **3.1.3** | 3.1.3 | highest stable in range; latest == candidate |
| fast-uri | ^3.0.1 | **3.1.8** | 4.2.1 | latest is OUT of range (4.x); `three` tag = 3.1.8 |
| json-schema-traverse | ^1.0.0 | **1.0.0** | 1.0.0 | only stable in range |
| require-from-string | ^2.0.2 | **2.0.2** | 2.0.2 | only stable in range |

Prereleases excluded (e.g. fast-deep-equal `3.0.0-beta.*`), not selected.

## 3. Candidate metadata

### fast-deep-equal @ 3.1.3
- engines: absent (compatibility not declared)
- dependencies: absent | peerDependencies: absent | optionalDependencies: absent
- dist.integrity: `sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==`
- dist.tarball: `https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz`

### fast-uri @ 3.1.8
- engines: absent (compatibility not declared)
- dependencies: absent | peerDependencies: absent | optionalDependencies: absent
- dist.integrity: `sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==`
- dist.tarball: `https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz`

### json-schema-traverse @ 1.0.0
- engines: absent (compatibility not declared)
- dependencies: absent | peerDependencies: absent | optionalDependencies: absent
- dist.integrity: `sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==`
- dist.tarball: `https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz`

### require-from-string @ 2.0.2
- engines: `{ "node": ">=0.10.0" }`
- dependencies: `{}` (empty) | peerDependencies: absent | optionalDependencies: absent
- dist.integrity: `sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==`
- dist.tarball: `https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz`

## 4. New transitive dependencies

None emerge from the four selected candidates (all four declare zero runtime/peer/optional dependencies). Therefore no new external URLs require authorization for this frontier.

Closure of the four-node range frontier: **complete at metadata level**. This does NOT assert global compatibility or tarball integrity, and does not cover the rest of the ajv@8.20.0 graph handled in separate captures.
