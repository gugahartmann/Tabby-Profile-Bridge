# Tabby Profile Bridge — Guia do Usuário

[Read in English](USER_GUIDE.md) · [README em português](../README.pt-BR.md)

## Idioma

O plugin utiliza o idioma configurado em **Configurações → Geral → Idioma** no Tabby. A interface fica em inglês para idiomas não traduzidos e em português quando o idioma efetivo é pt-BR ou pt-PT, inclusive se o Tabby estiver na opção **Automático**. A tela do plugin também acompanha alterações de idioma enquanto estiver aberta.

## Exportação

Abra **Configurações → Profile Bridge → Exportar**. Expanda as pastas e marque um grupo para incluir todos os perfis descendentes ou selecione conexões específicas. O filtro não altera a seleção existente. Os usuários são omitidos por padrão; marque explicitamente as contas compartilhadas que podem ser incluídas.

Em **Preservar hierarquia na raiz**, os caminhos são mantidos. Em **Colocar as sessões selecionadas dentro de uma pasta principal**, uma nova pasta é adicionada ao topo. Escolha CSV ou MobaXterm e exporte.

O CSV preserva nome, IP/hostname, porta SSH/Telnet, protocolo, usuários selecionados, caminhos, métodos de autenticação e algoritmos SSH permitidos, além de opções seguras de terminal. O MobaXterm preserva o subconjunto básico comum, inclusive X11 quando compatível. Nenhum deles inclui senhas, chaves privadas, caminhos de chaves, scripts, comandos de proxy, cores ou ícones.

## Importação

Escolha um ou mais arquivos .csv / .mxtsessions. Para cada arquivo, escolha importar na **raiz** ou em uma **pasta principal** específica. Revise os perfis e selecione **Manter / ignorar**, **Adicionar como novo** ou **Substituir existente**. Correspondências com perfis atuais são ignoradas por padrão. Altere o usuário em massa ou individualmente, se necessário.

**Critério de conflito:** mesmo protocolo + mesmo caminho de pastas + mesmo nome de perfil. Endereço/porta/usuário iguais sob outra pasta geram apenas um aviso. Ao substituir, as credenciais específicas do perfil existente podem ser descartadas.

## Estrutura CSV

Os arquivos CSV usam UTF-8 com BOM e CRLF. Colunas na ordem: group1, group2, other_groups, profile, protocol, hostname, port, username, auth, algorithms, settings. A terceira coluna agrupa os níveis restantes separados por barras, com escaping. As portas devem ser inteiros entre 1 e 65535. Algoritmos e configurações são strings JSON validadas.

## Estrutura MobaXterm

Importa .mxtsessions com seções [Bookmarks] e [Bookmarks_N], com a hierarquia em SubRep separada por barras invertidas. A exportação usa Windows-1252 e CRLF. Certos caracteres incompatíveis podem impedir a exportação, evitando gerar arquivos inválidos. Verifique os arquivos com o MobaXterm de destino.

## Segurança e backup

O plugin processa os arquivos localmente e não serializa credenciais intencionalmente. Nomes de dispositivos, IPs e usuários podem ser sensíveis. Revise os arquivos antes de compartilhar e faça backup da configuração do Tabby antes de substituir perfis.

No canto superior direito aparece **by gugahartmann · vX.Y.Z**, com a versão do plugin instalado.
