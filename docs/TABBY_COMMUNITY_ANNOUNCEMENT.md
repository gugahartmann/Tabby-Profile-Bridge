# Tabby community post — Profile Bridge v0.2.3

**Suggested title:** [Plugin] Tabby Profile Bridge v0.2.3 — Import/export MobaXterm and CSV sessions (EN/PT-BR)

Hi Tabby community!

I've released **Tabby Profile Bridge v0.2.3**, a community plugin for importing and exporting **SSH/Telnet connection profiles** between Tabby and other terminal clients.

The current version supports **MobaXterm (`.mxtsessions`)** and **CSV**, and includes:

- **Two-way import/export**, preserving nested folders and session details (hostname/IP, port and selected username).
- **Selective export** of individual sessions or entire profile groups.
- **Per-file import destinations**: import at the root or under a custom parent folder.
- **Conflict preview**: review existing matches and explicitly choose **Keep, Add or Replace** for each session.
- **Bulk username conversion** before importing sessions from colleagues or legacy systems.
- **English and Portuguese interfaces**, following Tabby's language settings.
- **Privacy-conscious exports**: usernames are opt-in; passwords and private-key material/paths are omitted.

I successfully tested the **Tabby → MobaXterm → Tabby** round-trip using demo sessions. Some terminal-specific advanced settings are intentionally not converted.

**Related project:** [Tabby Profile Share](https://github.com/gugahartmann/Tabby_Profile_Share) is its sibling plugin for sharing profiles directly **from Tabby to Tabby**, using a Tabby-oriented JSON package rather than converting to another terminal format.

**Installation tip:** Since Profile Bridge is a new plugin, Tabby's plugin-list search/sorting can place it **near the end of the Available plugins list**. If you don't see it at first, scroll down or look for **`tabby-profile-bridge`**.

**Project / screenshots:** https://github.com/gugahartmann/Tabby-Profile-Bridge

**Latest release (v0.2.3):** https://github.com/gugahartmann/Tabby-Profile-Bridge/releases/tag/v0.2.3

**npm:** https://www.npmjs.com/package/tabby-profile-bridge

Feedback and feature requests are very welcome! Future adapters I'm considering include **SecureCRT, mRemoteNG, Xshell, and other session managers**. This is an independent community plugin, not an official Tabby feature.

Thanks!
