import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('rumb')
    .setDescription('Abre o painel do Arsenal.');

export async function execute(interaction) {

    const CANAL_PERMITIDO = '1292571690903277728';
    const CARGO_POLICIAL = '1292571689946841217';

    
    if (interaction.channelId !== CANAL_PERMITIDO) {
        return interaction.reply({
            content: '❌ Este comando só pode ser usado no canal da RUMB.',
            ephemeral: true
        });
    }

   
    if (!interaction.member.roles.cache.has(CARGO_POLICIAL)) {
        return interaction.reply({
            content: '❌ Apenas policiais podem utilizar este comando.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('📋 RUMB')
        .setDescription('Selecione abaixo o formulário correspondente à ação que deseja realizar no arsenal.')
        .setColor('#1A237E')
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: 'Seção de Logística • 41° BPM' });

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_formulario')
            .setPlaceholder('Escolha uma opção...')
            .addOptions([
                {
                    label: 'Retirada de Equipamento',
                    description: 'Preencher ficha para retirar armamento.',
                    value: 'form_retirada',
                    emoji: '📥'
                },
                {
                    label: 'Devolução de Equipamento',
                    description: 'Preencher ficha para devolver armamento.',
                    value: 'form_devolucao',
                    emoji: '📤'
                },
                {
                    label: 'Registro de Perda',
                    description: 'Preencher ficha de extravio/perda de equipamento.',
                    value: 'form_perda',
                    emoji: '⚠️'
                }
            ])
    );

    await interaction.reply({
        embeds: [embed],
        components: [menu],
        ephemeral: true
    });
}
