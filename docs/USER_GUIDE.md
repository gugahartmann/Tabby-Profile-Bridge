# Tabby Profile Bridge — User Guide

[Leia em português](GUIA_USUARIO.pt-BR.md) · [README](../README.md)

## Language

The plugin follows Tabby's configured language in **Settings → General → Language**. The UI is English for all unsupported languages and Portuguese for the resolved pt-BR or pt-PT locale, including the **Automatic** Tabby setting. When Tabby changes its effective language, an already-open Profile Bridge panel updates automatically.

## Export workflow

Open **Settings → Profile Bridge → Export**. Expand nested folders and check an entire group to select all of its descendants or select individual connections. Filtering the tree does not change existing selections. Usernames are excluded by default; select shared usernames explicitly to include them.

With **Preserve hierarchy at root**, paths are exported unchanged. With **Place selected sessions inside one top-level folder**, that folder becomes an additional ancestor. Select CSV or MobaXterm to download the file.

CSV preserves names, hostnames/IPs, SSH/Telnet ports, protocol, selected usernames, nested group paths, supported SSH authentication and algorithms, and safe terminal settings. MobaXterm preserves the basic common subset, including X11 when compatible. Neither format carries passwords, private key contents or paths, login scripts, proxy commands, icons or colors.

## Import workflow

Choose one or more .csv / .mxtsessions files. Every file has its own **root** or **parent-folder** option. Review the profile list and confirm each requested action: **Keep / skip**, **Add as new**, or **Replace existing**. Existing matches are initially skipped. Use bulk username replacement or edit individual usernames before applying.

**Conflict matching:** same protocol + same folder path + same profile name. Same host/port/user in another folder is flagged for manual review, not automatically replaced. Replacing a profile discards its connection-specific credentials.

## CSV layout

CSV files use UTF-8 BOM and CRLF. Column order: group1, group2, other_groups, profile, protocol, hostname, port, username, auth, algorithms, settings. The third group column encodes remaining nested levels separated by slashes with escaping. Ports must be integers between 1 and 65535. Algorithms and settings use validated JSON strings.

## MobaXterm layout

Imports .mxtsessions with [Bookmarks] and [Bookmarks_N] sections; nested folders are represented in SubRep using backslashes. Export uses Windows-1252 and CRLF. Unsupported characters in some folder/session names can prevent export to avoid writing an invalid file. Always verify with the target MobaXterm release.

## Security and recovery

The plugin processes files locally and does not intentionally serialize credentials. Network names and user accounts can nonetheless be sensitive. Review the output before distribution and back up Tabby configuration before replacing profiles.

The top-right corner of the plugin displays **by gugahartmann · vX.Y.Z**, where the version comes from the installed package.
