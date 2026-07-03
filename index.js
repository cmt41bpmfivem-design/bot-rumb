import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();

client.once('ready', async () => {
    console.log(\`⚡ Bot online como \${client.user.tag}!\`);
    
    const commandsData = [];
    const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = await import(\`./src/commands/\${file}\`);
        client.commands.set(command.data.name, command);
        commandsData.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(config.TOKEN);

    try {
        console.log('🔄 Atualizando comandos Slash (/) no servidor...');
        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
            { body: commandsData }
        );
        console.log('✅ Comandos Slash registrados com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    } else {
        const { handleInteraction } = await import('./src/events/interactionCreate.js');
        await handleInteraction(interaction);
    }
});

client.login(process.env.TOKEN);