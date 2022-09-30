const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { apiToken } = require('../config.json');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('team-info')
		.setDescription('Montre diverses infos du clan!'),
	async execute(interaction) {
        axios
            .get('https://api.clashofclans.com/v1/clans/%232PVYQOOR', myConfig)
            .then(res => {
                const infoClanEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(res.data.name)
                    .setURL('https://discord.js.org/')
                    .setAuthor({ name: 'ReD SNaKe', iconURL: 'https://www.pinclipart.com/picdir/big/357-3577459_snake-tattoo-clipart-red-cobra-logo-esport-snake.png', url: 'https://discord.js.org' })
                    .setDescription(res.data.description)
                    .setThumbnail(res.data.badgeUrls.medium)
                    .addFields(
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Guerres gagnées', value: String(res.data.warWins) },
                        { name: 'Série de victoires', value: String(res.data.warWinStreak) },
                        { name: 'LDC', value: res.data.warLeague.name },
                        { name: 'Membres', value: String(res.data.members) },
                        { name: 'Niveau de la capitale', value: String(res.data.clanCapital.capitalHallLevel) },
                    )
                    .setImage('https://selenites.files.wordpress.com/2015/06/barbares.jpg?w=300&h=255')
                    .setTimestamp()
                    .setFooter({ text: 'Message du Barbare', iconURL: 'https://selenites.files.wordpress.com/2015/06/barbares.jpg?w=300&h=255' });
                return interaction.reply({ embeds: [infoClanEmbed] });
            })
            .catch(error => {
                return interaction.reply(error);
            });
	},
};