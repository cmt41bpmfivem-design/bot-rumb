'use strict';

require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const {
  Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder,
  ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder,
  ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags
} = require('discord.js');

// Configuração direta no código, sem CLIENT_ID ou IDs em variáveis de ambiente.
const CONFIG = {
  GUILD_ID: '1360772568436576536',
  CARGO_POLICIAL: '1563236861198082178',
  CANAL_RUMB: '1563237032350973993',
  CHANNELS: {
    RETIRADA: '1566169583348486184',
    DEVOLUCAO: '1566169514431873054',
    PERDA: '1566169534551953408'
  }
};

const FORMULARIOS = {
  form_retirada: {
    modalId: 'modal_retirada', canal: 'RETIRADA',
    titulo: '📥 Retirada de Equipamento', opcao: 'Retirada de Equipamento',
    descricao: 'Preencher ficha para retirar armamento.', emoji: '📥',
    labels: ['Armamentos retirados:', 'Quantidade de munições retiradas:', 'Equipamentos auxiliares retirados:'],
    relatorio: '📥 RELATÓRIO: RETIRADA DE ARMAMENTO', cor: '#2E7D32',
    campos: ['🔫 Armamentos Retirados', '🔋 Munições Retiradas', '🎒 Equipamentos Auxiliares']
  },
  form_devolucao: {
    modalId: 'modal_devolucao', canal: 'DEVOLUCAO',
    titulo: '📤 Devolução de Equipamento', opcao: 'Devolução de Equipamento',
    descricao: 'Preencher ficha para devolver armamento.', emoji: '📤',
    labels: ['Armamentos devolvidos:', 'Quantidade de munições devolvidas:', 'Equipamentos auxiliares devolvidos:'],
    relatorio: '📤 RELATÓRIO: DEVOLUÇÃO DE ARMAMENTO', cor: '#1565C0',
    campos: ['🔫 Armamentos Devolvidos', '🔋 Munições Devolvidas', '🎒 Equipamentos Devolvidos']
  },
  form_perda: {
    modalId: 'modal_perda', canal: 'PERDA',
    titulo: '⚠️ Registro de Perda', opcao: 'Registro de Perda',
    descricao: 'Preencher ficha de extravio/perda de equipamento.', emoji: '⚠️',
    labels: ['Armamentos perdidos:', 'Quantidade de munições perdidas:', 'Equipamentos auxiliares perdidos:'],
    relatorio: '⚠️ RELATÓRIO: EXTRAVIO / PERDA DE MATERIAL', cor: '#C62828',
    campos: ['🔫 Armamentos Perdidos', '🔋 Munições Perdidas', '🎒 Equipamentos Perdidos']
  }
};

const data = new SlashCommandBuilder().setName('rumb').setDescription('Abre o painel do Arsenal.');

function canaisPendentes() {
  return [
    ['canal da RUMB', CONFIG.CANAL_RUMB],
    ['retiradas', CONFIG.CHANNELS.RETIRADA],
    ['devoluções', CONFIG.CHANNELS.DEVOLUCAO],
    ['perdas/extravios', CONFIG.CHANNELS.PERDA]
  ].filter(([, id]) => !/^\d{17,20}$/.test(id)).map(([nome]) => nome);
}

function verificarAcesso(interaction) {
  if (interaction.guildId !== CONFIG.GUILD_ID || !interaction.inCachedGuild()) {
    throw new Error('Este bot atende somente ao servidor configurado.');
  }
  if (!interaction.member.roles.cache.has(CONFIG.CARGO_POLICIAL)) {
    throw new Error('Apenas policiais podem utilizar os formulários da RUMB.');
  }
  if (!CONFIG.CANAL_RUMB) {
    throw new Error('O canal da RUMB ainda não foi configurado. Procure a administração.');
  }
  if (interaction.channelId !== CONFIG.CANAL_RUMB) {
    throw new Error('Este comando e seus formulários só podem ser usados no canal da RUMB.');
  }
}

function criarModal(formulario) {
  const entradas = [
    ['input_nome', 'Nome/Graduação:', TextInputStyle.Short, 100],
    ['input_armas', formulario.labels[0], TextInputStyle.Paragraph, 1012],
    ['input_muni', formulario.labels[1], TextInputStyle.Short, 1000],
    ['input_equip', formulario.labels[2], TextInputStyle.Paragraph, 1012]
  ];
  const modal = new ModalBuilder().setCustomId(formulario.modalId).setTitle(formulario.titulo);
  modal.addComponents(entradas.map(([id, label, style, maxLength]) =>
    new ActionRowBuilder().addComponents(new TextInputBuilder()
      .setCustomId(id).setLabel(label).setStyle(style).setMaxLength(maxLength).setRequired(true))));
  return modal;
}

async function execute(interaction) {
  verificarAcesso(interaction);
  const embed = new EmbedBuilder().setTitle('📋 RUMB')
    .setDescription('Selecione abaixo o formulário correspondente à ação que deseja realizar no arsenal.')
    .setColor('#1A237E').setFooter({ text: 'Seção de Logística • BPChq' });
  const icone = interaction.guild.iconURL();
  if (icone) embed.setThumbnail(icone);
  const menu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
    .setCustomId('menu_formulario').setPlaceholder('Escolha uma opção...')
    .addOptions(Object.entries(FORMULARIOS).map(([value, form]) => ({
      label: form.opcao, description: form.descricao, value, emoji: form.emoji
    }))));
  await interaction.reply({ embeds: [embed], components: [menu], flags: MessageFlags.Ephemeral });
}

async function handleInteraction(interaction) {
  const comando = interaction.isChatInputCommand() && interaction.commandName === 'rumb';
  const menu = interaction.isStringSelectMenu() && interaction.customId === 'menu_formulario';
  const formulario = interaction.isModalSubmit()
    ? Object.values(FORMULARIOS).find(form => form.modalId === interaction.customId) : undefined;
  if (!comando && !menu && !formulario) return;
  try {
    if (comando) return await execute(interaction);
    verificarAcesso(interaction);
    if (menu) {
      const valor = interaction.values[0];
      if (!Object.hasOwn(FORMULARIOS, valor)) throw new Error('A opção selecionada não é válida. Abra /rumb novamente.');
      const form = FORMULARIOS[valor];
      if (!CONFIG.CHANNELS[form.canal]) {
        throw new Error('O canal desse formulário ainda não foi configurado. Procure a administração.');
      }
      return await interaction.showModal(criarModal(form));
    }
    const destino = CONFIG.CHANNELS[formulario.canal];
    if (!destino) throw new Error('O canal desse formulário ainda não foi configurado. Procure a administração.');
    const valores = ['input_nome', 'input_armas', 'input_muni', 'input_equip']
      .map(id => interaction.fields.getTextInputValue(id).trim());
    const limites = [100, 1012, 1000, 1012];
    if (valores.some((valor, i) => !valor || valor.length > limites[i])) {
      throw new Error('Preencha todos os campos respeitando o limite de caracteres do formulário.');
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const canal = await interaction.guild.channels.fetch(destino);
    if (!canal || !canal.isTextBased() || typeof canal.send !== 'function') {
      throw new Error('O canal configurado para este formulário não foi encontrado ou não aceita mensagens.');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const bloco = texto => '```text\n' + texto + '\n```';
    const embed = new EmbedBuilder().setTitle(formulario.relatorio).setColor(formulario.cor)
      .addFields(
        { name: '👤 Policial / Graduação', value: bloco(valores[0]) },
        ...formulario.campos.map((name, i) => ({ name, value: bloco(valores[i + 1]) })),
        { name: '📅 Horário e Data', value: `<t:${timestamp}:F> (<t:${timestamp}:R>)` }
      ).setFooter({ text: `Enviado por: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
    const icone = interaction.guild.iconURL();
    if (icone) embed.setThumbnail(icone);
    await canal.send({ embeds: [embed], allowedMentions: { parse: [] } });
    await interaction.editReply({ content: `✅ Seu formulário foi registrado e enviado com sucesso para <#${destino}>!`, allowedMentions: { parse: [] } });
  } catch (error) {
    console.error('Erro na interação RUMB:', error.message);
    const resposta = { content: `❌ ${error.message}`, allowedMentions: { parse: [] } };
    try {
      if (interaction.deferred && !interaction.replied) await interaction.editReply(resposta);
      else if (interaction.replied) await interaction.followUp({ ...resposta, flags: MessageFlags.Ephemeral });
      else await interaction.reply({ ...resposta, flags: MessageFlags.Ephemeral });
    } catch (falha) { console.error('Não foi possível responder à interação:', falha.message); }
  }
}

async function registrarComandos(token, aplicativoId) {
  if (!token) throw new Error('Defina TOKEN com o token da aplicação deste bot RUMB.');
  const rest = new REST({ version: '10' }).setToken(token);
  if (!aplicativoId) aplicativoId = (await rest.get(Routes.oauth2CurrentApplication())).id;
  await rest.put(Routes.applicationGuildCommands(aplicativoId, CONFIG.GUILD_ID), { body: [data.toJSON()] });
}

async function iniciar() {
  const token = process.env.TOKEN?.trim();
  if (!token) throw new Error('Defina TOKEN nas variáveis de ambiente com o token deste bot RUMB.');
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.on(Events.InteractionCreate, handleInteraction);
  client.on(Events.Error, error => console.error('Erro do Discord:', error.message));
  client.once(Events.ClientReady, () => {
    (async () => {
      await client.guilds.fetch(CONFIG.GUILD_ID);
      await registrarComandos(token, client.application.id);
      console.log(`✅ Bot RUMB 1.1.1 online como ${client.user.tag}. /rumb registrado no servidor ${CONFIG.GUILD_ID}.`);
      const pendentes = canaisPendentes();
      if (pendentes.length) console.warn(`Configure os IDs dos canais no código: ${pendentes.join(', ')}. Os formulários aguardam essa configuração.`);
    })().catch(error => console.error('Falha ao preparar o servidor/comando RUMB:', error.message));
  });
  for (const sinal of ['SIGINT', 'SIGTERM']) {
    process.once(sinal, () => { client.destroy(); process.exit(0); });
  }
  try { await client.login(token); }
  catch (error) { client.destroy(); throw error; }
}

if (require.main === module) {
  iniciar().catch(error => { console.error('Não foi possível iniciar o bot RUMB:', error.message); process.exitCode = 1; });
}

module.exports = { CONFIG, FORMULARIOS, data, canaisPendentes, criarModal, execute, handleInteraction, registrarComandos, iniciar };
