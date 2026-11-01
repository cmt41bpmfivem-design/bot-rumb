# Bot RUMB

Mantém o comando `/rumb` e os formulários de retirada, devolução e perda/extravio, com nome/graduação, armamentos, munições, equipamentos e data.

O código principal está completo em `index.js`, na raiz, sem importar arquivos de uma pasta `src`.

## Configuração do novo servidor

Já definidos no bloco `CONFIG` do `index.js`:

- Servidor: `1360772568436576536`.
- Cargo policial: `1563236861198082178`.
- Identificação da seção: BPChq.

Os quatro canais já estão definidos diretamente no código:

| Canal | ID |
| --- | --- |
| Uso do `/rumb` | `1563237032350973993` |
| Retiradas | `1566169583348486184` |
| Devoluções | `1566169514431873054` |
| Perdas/extravios | `1566169534551953408` |

Não é necessário preencher IDs de canais no painel da hospedagem. A única variável necessária é `TOKEN`, com o token deste bot RUMB.

## Hospedagem no Bot-Hosting.net

1. Use uma aplicação Node.js 24, a partir de 24.17.0.
2. Envie e extraia o ZIP inteiro. `index.js`, `package.json` e `package-lock.json` devem ficar juntos na raiz.
3. Arquivo inicial: `index.js`.
4. Em Environment/variáveis, preencha somente `TOKEN` com o token deste bot RUMB.
5. Comando de inicialização: `npm ci && npm start`.

O ID do aplicativo é obtido automaticamente pelo token. O `/rumb` é registrado somente no servidor configurado. Não precisa preencher `CLIENT_ID`, `GUILD_ID`, `RETIRADA`, `DEVOLUCAO` ou `PERDA` no painel: os IDs ficam no código.

O bot precisa estar convidado para o Discord com os escopos `bot` e `applications.commands`, acesso aos canais e permissões para ver canais, enviar mensagens e inserir embeds. Esta versão usa somente o intent Guilds e não exige Server Members ou Message Content.

Somente membros com o cargo policial configurado usam os formulários. O acesso é verificado ao abrir o painel, escolher a ação e enviar o formulário. As respostas do painel são privadas; os relatórios são enviados aos canais configurados.

Não há arquivo de registros ou banco local: os relatórios ficam nas mensagens do Discord.

## Rodar no PC

Copie `.env.example` para `.env`, preencha `TOKEN` e execute na pasta do projeto:

```bash
npm ci
npm start
```

`npm test` verifica os formulários sem token, sem conectar ao Discord e sem enviar mensagens reais.
