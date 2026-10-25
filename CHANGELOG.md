# Changelog

## v0.2.1 — Angular template hotfix
- Move conflict-count calculation out of the Angular template into the component.
- Add Angular 15 template-parser regression test to verify the generated Pug HTML at CI time.
- Fix failure to open Profile Bridge settings on plugin installation.

## v0.2.0 — MobaXterm
- .mxtsessions import and export for SSH/Telnet, with folder nesting and custom ports.
- CP1252 decoding/encoding and CRLF output.
- Warnings for unsupported MobaXterm settings.
- Synthetic fixture tests; never publish uploaded operational sessions.


## v0.1.0 — CSV
- CSV import/export with nested folders and optional container group.
- Per-profile review: keep, create or replace.
- Username bulk conversion and opt-in usernames on export.
- Safe algorithm/setting JSON columns, with no credential export.
- Unit tests and CI release workflow.
