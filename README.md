# Tabby Profile Bridge

**Your connections, across terminals.**

Import and export Tabby SSH/Telnet sessions, preserving nested profile groups. Inspired by Tabby Profile Share (https://github.com/gugahartmann/Tabby_Profile_Share).

## v0.1.0 — CSV

- Select sessions or entire nested folder trees and choose which usernames may be exported.
- Export to UTF-8 CSV with Excel BOM: group1, group2, other_groups, profile, protocol, hostname, port, username, auth, algorithms, settings.
- First two folder levels are standalone columns; the remaining folder levels are slash-delimited with escaping.
- Export at root or wrap the entire exported selection in one top-level folder.
- Import multiple CSV files, each at root or inside its own container folder.
- Review sessions before import. Existing sessions matching protocol + folder + name are skipped by default. Explicitly choose Add / Replace / Keep for each row.
- Edit SSH usernames individually or convert users in bulk.
- Export only whitelisted algorithm and terminal settings as JSON in CSV cells, NEVER passwords, private key content, private key paths or scripts.

**Limits:** 5 MB/file; 10,000 sessions/file; 32 folder levels. MobaXterm (.mxtsessions) added in v0.2.

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

v0.2: MobaXterm (.mxtsessions) import/export. Later adapters: SecureCRT, mRemoteNG, PuTTY and others.

MIT © 2026 gugahartmann.
