# Cross-format round-trip tests

The CI suite imports the **public and synthetic** fixture `test/fixtures/demo-profiles.yaml`, copied
unchanged from `Tabby_Profile_Share/examples/demo-profiles.yaml`.

It runs the exact production encoders/decoders in `src/exchangeFormats.js`:

```
Tabby YAML fixture
  → select profiles and source hierarchy
  → encoder (CSV or MobaXterm)
  → serialized file contents (text or raw bytes)
  → decoder
  → conflict preview
  → import plan
  → canonical comparison with YAML
```

For each adapter, the same tests check:
1. All **10 groups and 16 SSH profiles**, full original paths, group names, hostname/IP,
   port (including 2222), protocol and SSH username (including blanks).
2. Full-folder wrapping on export and separate per-file destination wrapping on import.
3. Exporting only a selection, with only the necessary ancestors (and no unrelated groups).
4. Deliberate redaction of all usernames when export permission is not granted.
5. Conflict detection against a preexisting tree: 16 skipped by default, single
   replacement only when explicitly selected.
6. A negative control verifies that the comparison detects a changed port or group parent.

`id`, `icon` and `color` are deliberately not compared: neither CSV nor
`.mxtsessions` guarantees preservation of these Tabby-specific attributes. Secret
fields are not present in the fixture. Advanced SSH options have separate adapter
unit tests because the two exchange formats do not share the same feature set.

## Extending the test to new terminal clients

Implement `encode(rows)` and `decode(file)` in a new adapter entry in
`src/exchangeFormats.js`. The matrix tests automatically iterate the `FORMATS`
registry — **do not create one-off round-trip tests per format**. Add any necessary
format-specific tests alongside the shared matrix. Every adapter is expected to
round-trip the safe connection details of the reference fixture without data loss.

Run:

```bash
npm install --legacy-peer-deps --ignore-scripts
npm test
npm run build
```

**Limitations:** these automated tests exercise parsers and import plans, not the
actual behavior of a third-party terminal program or the Tabby GUI. A human smoke
test in both applications is still required before claiming full compatibility.
