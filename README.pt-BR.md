# Tabby Profile Bridge

**Suas conexões, em diferentes terminais.**

Importe e exporte perfis SSH/Telnet entre o Tabby, arquivos CSV e o MobaXterm, preservando a hierarquia das pastas.

**by gugahartmann** · [English](https://github.com/gugahartmann/Tabby-Profile-Bridge/blob/main/README.md)
## Versão atual — v0.2.3

**O Profile Bridge permite trocar perfis SSH/Telnet entre o Tabby e outros terminais**, com suporte a CSV e arquivos `.mxtsessions` do MobaXterm.

| | Recurso | Como funciona |
| --- | --- | --- |
| ↔ | **Importação e exportação** | Exporte sessões do Tabby e importe o arquivo de volta para o Tabby ou para o MobaXterm |
| 📁 | **Hierarquia de pastas** | Preserve regiões, cidades e POPs, com opção de usar uma pasta principal para cada importação/exportação |
| 🔍 | **Prévia de conflitos** | Revise nome, IP/hostname, porta SSH e usuário antes de escolher Manter, Adicionar ou Substituir |
| 👤 | **Alteração em massa** | Substitua usuários antigos ou específicos de outros colegas antes de importar |
| 🌐 | **EN / PT-BR** | Interface no idioma selecionado no Tabby, com inglês como padrão |
| 🔐 | **Privacidade** | Exportação de usuários sob confirmação; sem senhas, chaves privadas ou caminhos de chaves |

**Validação prática:** o fluxo Tabby → MobaXterm → Tabby já foi testado manualmente com o plugin. Recursos avançados específicos do MobaXterm ainda podem exigir conferência individual.

[**Baixar v0.2.3**](https://github.com/gugahartmann/Tabby-Profile-Bridge/releases/tag/v0.2.3) · [Notas da versão](docs/releases/v0.2.3.md) · [Texto de divulgação](https://github.com/gugahartmann/Tabby-Profile-Bridge/blob/main/docs/TABBY_COMMUNITY_ANNOUNCEMENT.md)



### Capturas de tela

**Exportação — escolha os grupos e perfis que deseja compartilhar**

![Exportação no Tabby Profile Bridge: grupos, perfis SSH, usuários e formato MobaXterm](https://raw.githubusercontent.com/gugahartmann/Tabby-Profile-Bridge/main/docs/screenshots/tabby-export.png)

**Importação — revise os perfis, altere usuários e decida como tratar as conexões existentes**

![Importação no Tabby Profile Bridge: sessões do MobaXterm e revisão de conflitos](https://raw.githubusercontent.com/gugahartmann/Tabby-Profile-Bridge/main/docs/screenshots/tabby-import.png)

## Funcionalidades

- **CSV e MobaXterm**: importação e exportação de .csv e .mxtsessions.
- **Pastas aninhadas**: escolha grupos completos ou sessões individuais, mantendo os grupos ancestrais necessários.
- **Destino da exportação**: mantenha a hierarquia na raiz ou coloque as sessões em uma pasta principal.
- **Destino por arquivo**: cada arquivo importado pode ir para a raiz ou para sua própria pasta principal.
- **Prévia de conflitos**: revise hostname, porta, usuário e possíveis correspondências antes de escolher Manter / ignorar, Adicionar como novo ou Substituir existente. O padrão é não substituir.
- **Alteração de usuários em massa** antes da importação ou edição individual.
- **Privacidade**: nomes de usuário só entram na exportação se selecionados. Senhas, chaves privadas, caminhos de chaves, scripts de login e comandos de proxy não são exportados.
- **Interface bilíngue**: inglês por padrão e português quando o Tabby utiliza pt-BR ou pt-PT, inclusive com detecção automática de idioma.
- **Créditos e versão** no canto superior direito: by gugahartmann · vX.Y.Z.

## Instalação

Quando estiver disponível no registro npm, procure **tabby-profile-bridge** em Tabby → Configurações → Plugins. Também é possível obter o pacote .tgz nas [releases do GitHub](https://github.com/gugahartmann/Tabby-Profile-Bridge/releases) e usar um procedimento de instalação de plugins compatível com sua versão do Tabby.

Após ativar o plugin, abra **Configurações → Profile Bridge**.

## Exportação

1. Na aba **Exportar**, marque os grupos ou perfis SSH/Telnet desejados.
2. Selecione explicitamente quais usuários podem constar no arquivo.
3. Escolha **Preservar hierarquia na raiz** ou definir uma **pasta principal**.
4. Selecione **CSV** ou **MobaXterm** e exporte.

## Importação

1. Na aba **Importar**, selecione um ou mais arquivos CSV ou MobaXterm.
2. Para **cada arquivo**, escolha importar na raiz ou dentro de uma pasta principal.
3. Revise os perfis encontrados e os avisos.
4. Se desejar, altere usuários antigos em massa ou individualmente.
5. Para cada perfil, escolha **Manter / ignorar**, **Adicionar como novo** ou **Substituir existente**, e aplique as alterações.

Uma correspondência entre nome, protocolo e pasta começa como Manter / ignorar. Endereços iguais em outras pastas são apenas sinalizados. Faça backup do Tabby antes de substituir conexões.

## Colunas do CSV

| group1 | group2 | other_groups | profile | protocol | hostname | port | username |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Região | Cidade | POP / Core | CORE-01 | ssh | 192.0.2.10 | 30022 | netops |
| Região | Cidade | POP / Acesso | OLT-01 | ssh | 192.0.2.11 | 22 | |

Outras colunas: **auth**, **algorithms** e **settings** (JSON seguro). Os dois primeiros níveis de pasta ficam em colunas próprias; níveis mais profundos são codificados em other_groups com separadores escapados. Os IPs da tabela são reservados para exemplos.

## Compatibilidade MobaXterm

Compatível com bookmarks SSH/Telnet .mxtsessions, nomes, pastas aninhadas, IP/hostname, portas personalizadas, usuários e X11 básico. Configurações avançadas específicas do MobaXterm podem não ser preservadas. Verifique o arquivo no programa de destino antes de usar em produção.

## Segurança e limites

O processamento ocorre localmente. Hostnames, IPs e usuários autorizados ainda podem ser informações sensíveis. Senhas, conteúdo/caminhos de chaves privadas, scripts e comandos de proxy não são exportados. Substituir um perfil descarta as credenciais específicas anteriores.

Limites: **5 MB/arquivo**, **10.000 perfis/arquivo**, **32 níveis de pasta**. O formato do MobaXterm pode rejeitar certos caracteres nos nomes de pastas e sessões.

## Documentação

- [Guia do Usuário (português)](https://github.com/gugahartmann/Tabby-Profile-Bridge/blob/main/docs/GUIA_USUARIO.pt-BR.md)
- [User Guide (English)](https://github.com/gugahartmann/Tabby-Profile-Bridge/blob/main/docs/USER_GUIDE.md)
- [Histórico de versões](https://github.com/gugahartmann/Tabby-Profile-Bridge/blob/main/CHANGELOG.md)

## Próximas integrações

SecureCRT, mRemoteNG e outros gerenciadores de conexões.

MIT © 2026 gugahartmann.
