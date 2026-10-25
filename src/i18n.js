'use strict'
// Local plugin copy only. The host Tabby's resolved locale is the source of truth.
// English is the fallback for every unsupported language or unknown key.
const TEXT = {
  "description": {
    "en": "Import, export, and convert SSH/Telnet profiles between terminal clients. Passwords, login scripts, private keys, and local key paths are never exported.",
    "pt": "Importe, exporte e converta perfis SSH/Telnet entre clientes de terminal. Senhas, scripts de login, chaves privadas e caminhos locais de chaves nunca são exportados."
  },
  "export": {
    "en": "Export",
    "pt": "Exportar"
  },
  "import": {
    "en": "Import",
    "pt": "Importar"
  },
  "selectFolders": {
    "en": "Select folders and sessions",
    "pt": "Selecione pastas e sessões"
  },
  "selectAll": {
    "en": "Select all",
    "pt": "Selecionar tudo"
  },
  "clear": {
    "en": "Clear",
    "pt": "Limpar"
  },
  "searchPlaceholder": {
    "en": "Filter by name (selection is preserved)",
    "pt": "Filtrar por nome (a seleção é preservada)"
  },
  "ungrouped": {
    "en": "Ungrouped",
    "pt": "Sem grupo"
  },
  "exportUsers": {
    "en": "Export usernames",
    "pt": "Exportar usuários"
  },
  "userOptIn": {
    "en": "Usernames are excluded by default. Explicitly select the shared service accounts to include.",
    "pt": "Usuários são omitidos por padrão. Selecione explicitamente as contas compartilhadas que deseja incluir."
  },
  "selectToListUsers": {
    "en": "Select sessions to see their usernames.",
    "pt": "Selecione sessões para listar os usuários."
  },
  "sessions": {
    "en": "sessions",
    "pt": "sessões"
  },
  "exportFolder": {
    "en": "Export destination folder",
    "pt": "Pasta de destino da exportação"
  },
  "preserveHierarchy": {
    "en": "Preserve hierarchy at root",
    "pt": "Preservar hierarquia na raiz"
  },
  "wrapExport": {
    "en": "Place selected sessions inside one top-level folder",
    "pt": "Colocar as sessões selecionadas dentro de uma pasta principal"
  },
  "folderPlaceholder": {
    "en": "Top-level folder name",
    "pt": "Nome da pasta principal"
  },
  "format": {
    "en": "Format",
    "pt": "Formato"
  },
  "csvHelp": {
    "en": "Algorithms and safe terminal options are stored as JSON strings in CSV cells. Group colors and icons are not exported.",
    "pt": "Algoritmos e opções seguras de terminal são armazenados como texto JSON nas células do CSV. Cores e ícones dos grupos não são exportados."
  },
  "mobaHelp": {
    "en": "MobaXterm export preserves names, hierarchy, hosts, ports, usernames, and basic X11. Unsupported advanced options, colors, icons, and secrets are omitted.",
    "pt": "A exportação MobaXterm preserva nomes, hierarquia, hosts, portas, usuários e X11 básico. Opções avançadas incompatíveis, cores, ícones e segredos são omitidos."
  },
  "exportProfiles": {
    "en": "Export {count} profiles",
    "pt": "Exportar {count} perfis"
  },
  "addFiles": {
    "en": "Add CSV or MobaXterm files",
    "pt": "Adicionar arquivos CSV ou MobaXterm"
  },
  "importDescription": {
    "en": "Import each file at the root or inside its own parent folder. Review conflicts before applying; existing profiles are never replaced automatically.",
    "pt": "Importe cada arquivo na raiz ou dentro de sua própria pasta principal. Revise os conflitos antes de aplicar; perfis existentes nunca são substituídos automaticamente."
  },
  "remove": {
    "en": "Remove",
    "pt": "Remover"
  },
  "importRoot": {
    "en": "Import at Tabby root (keep source hierarchy)",
    "pt": "Importar na raiz do Tabby (manter hierarquia de origem)"
  },
  "importFolder": {
    "en": "Import inside one parent folder",
    "pt": "Importar dentro de uma pasta principal"
  },
  "parentFolderPlaceholder": {
    "en": "Parent folder name",
    "pt": "Nome da pasta principal"
  },
  "matchingNames": {
    "en": "{count} matching names in destination",
    "pt": "{count} nomes coincidentes no destino"
  },
  "mobaWarning": {
    "en": "{count} MobaXterm entries/settings were not converted. First: {first}",
    "pt": "{count} entradas/configurações do MobaXterm não foram convertidas. Primeira: {first}"
  },
  "bulkUser": {
    "en": "Bulk username conversion",
    "pt": "Alteração de usuário em massa"
  },
  "originalUser": {
    "en": "Original username",
    "pt": "Usuário original"
  },
  "allUsers": {
    "en": "All imported usernames",
    "pt": "Todos os usuários importados"
  },
  "emptyUser": {
    "en": "(empty)",
    "pt": "(vazio)"
  },
  "newUser": {
    "en": "New username",
    "pt": "Novo usuário"
  },
  "newUserPlaceholder": {
    "en": "New SSH username",
    "pt": "Novo usuário SSH"
  },
  "applyUser": {
    "en": "Apply to selected imports",
    "pt": "Aplicar às importações selecionadas"
  },
  "reviewProfiles": {
    "en": "Review {count} imported profiles",
    "pt": "Revisar {count} perfis importados"
  },
  "skipAll": {
    "en": "Skip all",
    "pt": "Ignorar todos"
  },
  "createAll": {
    "en": "Create all",
    "pt": "Criar todos"
  },
  "session": {
    "en": "Session",
    "pt": "Sessão"
  },
  "hostPort": {
    "en": "Host : port",
    "pt": "Host : porta"
  },
  "username": {
    "en": "Username",
    "pt": "Usuário"
  },
  "match": {
    "en": "Existing match",
    "pt": "Correspondência existente"
  },
  "action": {
    "en": "Action",
    "pt": "Ação"
  },
  "root": {
    "en": "(root)",
    "pt": "(raiz)"
  },
  "sameName": {
    "en": "Same name / folder",
    "pt": "Mesmo nome / pasta"
  },
  "sameEndpoint": {
    "en": "Same endpoint elsewhere",
    "pt": "Mesmo destino em outra pasta"
  },
  "new": {
    "en": "New",
    "pt": "Novo"
  },
  "skip": {
    "en": "Keep / skip",
    "pt": "Manter / ignorar"
  },
  "create": {
    "en": "Add as new",
    "pt": "Adicionar como novo"
  },
  "replace": {
    "en": "Replace existing",
    "pt": "Substituir existente"
  },
  "replaceWarning": {
    "en": "Replacing a profile removes its connection-specific credentials. Back up your Tabby configuration first. Imported files are never executed.",
    "pt": "Substituir um perfil remove suas credenciais específicas. Faça backup da configuração do Tabby antes. Arquivos importados nunca são executados."
  },
  "applyChanges": {
    "en": "Apply {count} selected changes",
    "pt": "Aplicar {count} alterações selecionadas"
  },
  "importing": {
    "en": "Importing...",
    "pt": "Importando..."
  },
  "exportedSuccess": {
    "en": "Exported {count} sessions without passwords or private keys.",
    "pt": "Exportadas {count} sessões sem senhas ou chaves privadas."
  },
  "importedSuccess": {
    "en": "Imported {created} new sessions, replaced {replaced}, created {groups} folders.",
    "pt": "Importadas {created} sessões novas, substituídas {replaced} e criadas {groups} pastas."
  },
  "invalidFolder": {
    "en": "Container folder cannot contain slashes.",
    "pt": "O nome da pasta principal não pode conter barras."
  },
  "tooLarge": {
    "en": "File exceeds 5 MB: {file}",
    "pt": "O arquivo excede 5 MB: {file}"
  },
  "tooLongUser": {
    "en": "Username is too long.",
    "pt": "O nome de usuário é muito longo."
  },
  "selectImport": {
    "en": "Select at least one profile to import.",
    "pt": "Selecione pelo menos um perfil para importar."
  },
  "errorPrefix": {
    "en": "Operation failed: {error}",
    "pt": "Falha na operação: {error}"
  }
}
function resolveLanguage(locale) {
    return typeof locale === 'string' && /^pt(?:-|$)/i.test(locale) ? 'pt' : 'en'
}
function translate(locale,key,params={}) {
    const entry=TEXT[key]
    const pattern=entry ? entry[resolveLanguage(locale)] : key
    return pattern.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g,(match,name) => Object.prototype.hasOwnProperty.call(params,name) ? String(params[name]) : match)
}
module.exports={ TEXT,resolveLanguage,translate }
