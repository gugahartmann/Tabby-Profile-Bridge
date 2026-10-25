# Tabby Profile Bridge

**Your connections, across terminals.**

Import and export Tabby SSH/Telnet sessions, preserving nested profile groups. Inspired by Tabby Profile Share (https://github.com/gugahartmann/Tabby_Profile_Share).

## v0.2.1 — Angular template hotfix

- Fix Angular JIT `Bindings cannot contain assignments` error when opening the plugin.
- CI now parses the generated Pug template with Angular 15 compiler to prevent this regression.

## v0.2.0 — MobaXterm

- Import and export MobaXterm .mxtsessions files (SSH and Telnet).
- Preserve hierarchical folders, names, hostnames, ports, usernames and basic X11 setting.
- Read MobaXterm CP1252 files, including older session field counts, and write CRLF/CP1252 output.
- Show warnings when advanced settings cannot be represented. Deliberately never export passwords, key paths, gateways, macros, SSH algorithms or terminal colors to .mxtsessions.
- Reject group/session names containing unsupported delimiters instead of writing corrupt exports.
- MobaXterm export is based on a documented Moba 23.6-compatible subset; verification in a real MobaXterm installation is recommended.

## v0.1.0 — CSV

- Select sessions or entire nested folder trees and choose which usernames may be exported.
- Export to UTF-8 CSV with Excel BOM: group1, group2, other_groups, profile, protocol, hostname, port, username, auth, algorithms, settings.
- First two folder levels are standalone columns; the remaining folder levels are slash-delimited with escaping.
- Export at root or wrap the entire exported selection in one top-level folder.
- Import multiple CSV files, each at root or inside its own container folder.
- Review sessions before import. Existing sessions matching protocol + folder + name are skipped by default. Explicitly choose Add / Replace / Keep for each row.
- Edit SSH usernames individually or convert users in bulk.
- Export only whitelisted algorithm and terminal settings as JSON in CSV cells, NEVER passwords, private key content, private key paths or scripts.

**Limits:** 5 MB/file; 10,000 sessions/file; 32 folder levels. MobaXterm (.mxtsessions) available in v0.2.

## Format-independent round-trip test suite

All supported import/export formats are validated against the same fictional YAML fixture (10 nested groups and 16 SSH sessions). Every test serializes the real export format, parses it again, creates the Tabby import plan and compares folder paths, names, hosts, ports and usernames. The suite also tests export/import wrapper folders, subset selections, redaction and conflict actions. Adding an adapter to `src/exchangeFormats.js` enrolls it in the matrix automatically.

See [docs/ROUNDTRIP_TESTS.md](docs/ROUNDTRIP_TESTS.md) and run `npm test`.

## Installation and testing

Inside Tabby use Settings → Plugins → search for tabby-profile-bridge (once published to npm). For local development: npm install --legacy-peer-deps; npm test; npm run build.
GitHub Releases carry npm installable .tgz files. GitHub releases DO NOT publish packages to npm by themselves.

## Example CSV (all data fictitious)

```csv
group1,group2,other_groups,profile,protocol,hostname,port,username,auth,algorithms,settings
South,Porto Alegre,POP01 / CORE,SW-CORE-01,ssh,192.0.2.10,30022,operator,agent,"{""kex"":[""diffie-hellman-group14-sha1""]}","{""term"":""xterm-256color""}"
South,Porto Alegre,POP01 / CORE,BNG-01,ssh,192.0.2.11,22,,,,
```

## Security

All import files are treated as untrusted data, validated before changing config. Formula-like CSV cells are escaped. Changes are best-effort transactional with rollback. The plugin does not import/export passwords, login scripts, private keys, key paths, proxy commands, or unsupported options. Replacing an existing profile intentionally discards its connection-specific secrets: back up Tabby first.

## Roadmap

v0.1: CSV; v0.2: MobaXterm (.mxtsessions). Later adapters: SecureCRT, mRemoteNG, PuTTY and others.

MIT © 2026 gugahartmann.
