import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import config from '../config/config.js';

export async function handleInteraction(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'menu_formulario') {
        const valorSelecionado = interaction.values[0];
        let modalTitle = '', customIdModal = '', labelArma = '', labelMuni = '', labelEquip = '';

        if (valorSelecionado === 'form_retirada') {
            modalTitle = '📥 Retirada de Equipamento'; customIdModal = 'modal_retirada';
            labelArma = 'Armamentos retirados:'; labelMuni = 'Quantidade de munições retirados:'; labelEquip = 'Equipamento auxiliar retirados:';
        } else if (valorSelecionado === 'form_devolucao') {
            modalTitle = '📤 Devolução de Equipamento'; customIdModal = 'modal_devolucao';
            labelArma = 'Armamentos devolvidos:'; labelMuni = 'Quantidade de munições devolvidas:'; labelEquip = 'Equipamento auxiliar devolvidos:';
        } else if (valorSelecionado === 'form_perda') {
            modalTitle = '⚠️ Registro de Perda'; customIdModal = 'modal_perda';
            labelArma = 'Armamentos perdidos:'; labelMuni = 'Quantidade de munições perdidos:'; labelEquip = 'Equipamento auxiliar perdidos:';
        }

        const modal = new ModalBuilder().setCustomId(customIdModal).setTitle(modalTitle);
        const inputNome = new TextInputBuilder().setCustomId('input_nome').setLabel('Nome/Graduação:').setStyle(TextInputStyle.Short).setRequired(true);
        const inputArmas = new TextInputBuilder().setCustomId('input_armas').setLabel(labelArma).setStyle(TextInputStyle.Paragraph).setRequired(true);
        const inputMuni = new TextInputBuilder().setCustomId('input_muni').setLabel(labelMuni).setStyle(TextInputStyle.Short).setRequired(true);
        const inputEquip = new TextInputBuilder().setCustomId('input_equip').setLabel(labelEquip).setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputNome),
            new ActionRowBuilder().addComponents(inputArmas),
            new ActionRowBuilder().addComponents(inputMuni),
            new ActionRowBuilder().addComponents(inputEquip)
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
        const nome = interaction.fields.getTextInputValue('input_nome');
        const armas = interaction.fields.getTextInputValue('input_armas');
        const muni = interaction.fields.getTextInputValue('input_muni');
        const equip = interaction.fields.getTextInputValue('input_equip');
        let embedLog = new EmbedBuilder().setThumbnail(interaction.guild.iconURL());
        let canalEnvioId = '';

        const timestamp = Math.floor(Date.now() / 1000);

        if (interaction.customId === 'modal_retirada') {
            canalEnvioId = config.CHANNELS.RETIRADA;
            embedLog.setTitle('📥 RELATÓRIO: RETIRADA DE ARMAMENTO').setColor('#2E7D32')
                .addFields(
                    { name: '👤 Policial / Graduação', value: `\`\`\`text\n${nome}\n\`\`\`` },
                    { name: '🔫 Armamentos Retirados', value: `\`\`\`text\n${armas}\n\`\`\`` },
                    { name: '🔋 Munições Retiradas', value: `\`\`\`text\n${muni}\n\`\`\`` },
                    { name: '🎒 Equipamentos Auxiliares', value: `\`\`\`text\n${equip}\n\`\`\`` },
                    { name: '📅 Horário e Data', value: `<t:${timestamp}:F> (<t:${timestamp}:R>)` }
                );
        } else if (interaction.customId === 'modal_devolucao') {
            canalEnvioId = config.CHANNELS.DEVOLUCAO;
            embedLog.setTitle('📤 RELATÓRIO: DEVOLUÇÃO DE ARMAMENTO').setColor('#1565C0')
                .addFields(
                    { name: '👤 Policial / Graduação', value: `\`\`\`text\n${nome}\n\`\`\`` },
                    { name: '🔫 Armamentos Devolvidos', value: `\`\`\`text\n${armas}\n\`\`\`` },
                    { name: '🔋 Munições Devolvidas', value: `\`\`\`text\n${muni}\n\`\`\`` },
                    { name: '🎒 Equipamentos Devolvidos', value: `\`\`\`text\n${equip}\n\`\`\`` },
                    { name: '📅 Horário e Data', value: `<t:${timestamp}:F> (<t:${timestamp}:R>)` }
                );
        } else if (interaction.customId === 'modal_perda') {
            canalEnvioId = config.CHANNELS.PERDA;
            embedLog.setTitle('⚠️ RELATÓRIO: EXTRAVIO / PERDA DE MATERIAL').setColor('#C62828')
                .addFields(
                    { name: '👤 Policial / Graduação', value: `\`\`\`text\n${nome}\n\`\`\`` },
                    { name: '🔫 Armamentos Perdidos', value: `\`\`\`text\n${armas}\n\`\`\`` },
                    { name: '🔋 Munições Perdidas', value: `\`\`\`text\n${muni}\n\`\`\`` },
                    { name: '🎒 Equipamentos Perdidos', value: `\`\`\`text\n${equip}\n\`\`\`` },
                    { name: '📅 Horário e Data', value: `<t:${timestamp}:F> (<t:${timestamp}:R>)` }
                );
        }

        embedLog.setFooter({ text: `Enviado por: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        const canal = interaction.guild.channels.cache.get(canalEnvioId);
        if (canal) {
            await canal.send({ embeds: [embedLog] });
            await interaction.reply({ content: `✅ Seu formulário foi registrado e enviado com sucesso para ${canal}!`, ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Erro: O canal configurado para este formulário não foi encontrado.', ephemeral: true });
        }
    }
}
