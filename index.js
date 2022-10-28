const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, codeBlock } = require('discord.js');
const { token, environment } = require('./config.json');
const addMembersFunctions = require('./functions/addMembers.js');
const deleteMembersFunctions = require('./functions/deleteMembers.js');
const statsFunctions = require('./functions/stats.js');
const capitalManager = require('./functions/capitalManager.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(new Date(), 'Ready!');
	const channel = client.channels.cache.get('1033369410519445604');
	channel.send(codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'Ready!'));

	// Add new Team Members
	setInterval(addMembersFunctions.addTheMembers, 30 * 60 * 1000);

	// Delete old Team Members
	setInterval(deleteMembersFunctions.deleteTheMembers, 24 * 60 * 1000);

	// Update Stats
	setInterval(statsFunctions.updateStats, 60 * 60 * 1000);

	// Update CapitalRaids
	setInterval(capitalManager.checkStatus, 5 * 60 * 1000, client);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);