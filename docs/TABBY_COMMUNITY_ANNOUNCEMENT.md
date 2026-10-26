# Tabby community post — ready to publish

**Suggested title:** [Plugin] Tabby Profile Bridge — import/export MobaXterm and CSV profiles (EN/PT-BR)

**Post body:**

Hi Tabby community!

I've been working on **Tabby Profile Bridge**, a plugin that helps move SSH/Telnet connection profiles between Tabby and other terminal clients. The current release supports **MobaXterm `.mxtsessions`** and **CSV**.

It supports:
- Exporting selected sessions or entire folders while preserving nested group paths.
- Importing multiple files at the root or into a separate parent folder for each file.
- Reviewing possible duplicate profiles before choosing Keep, Add, or Replace.
- Converting SSH usernames in bulk before import.
- English and Portuguese interfaces, following Tabby's language settings.
- Exports that omit passwords and private key material; usernames are opt-in.

I tested the complete **Tabby → MobaXterm → Tabby** workflow successfully with example sessions.

Source and documentation: https://github.com/gugahartmann/Tabby-Profile-Bridge

Release v0.2.2: https://github.com/gugahartmann/Tabby-Profile-Bridge/releases/tag/v0.2.2

Feedback and suggestions are welcome, especially for future SecureCRT and mRemoteNG adapters. This is a community plugin and not an official Tabby feature.

Thanks!
