const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const { Sequelize } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('team-members')
		.setDescription('Montre la liste des membres de ton clan!')
        .addStringOption(option =>
            option.setName('team-tag')
                .setDescription('Team Tag of the Team you want to see members.')
                .setRequired(true)),
	async execute(interaction) {
        // Récupération des options
        const team_tag = interaction.options.getString('team-tag');

        // Connexion à la base de données
        const sequelize = new Sequelize('database', 'username', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: '/home/trebla/ZDEV/discord/clashdash/database.sqlite',
            freezeTableName: true,
        });

        // Connexion aux tables
        const Members = require('../models/Members')(sequelize, Sequelize.DataTypes);

        // Requête membres
        (async () => {
            try {
                await sequelize.authenticate();
                console.log('Connection has been established successfully.');
            } catch (error) {
                console.error('Unable to connect to the database:', error);
            }
            try {
                const query = await Members.findAll({
                    attributes: ['player_id', 'player_name'],
                    where: {
                        clan_id: team_tag,
                    },
                });
                // Debugging purposes
                console.log(query);
                let members = '';

                for await (const data of query) {
                    // Debugging purposes
                    // console.log(data);
                    members += data.player_id;
                    if (data.player_id.length == 9) {
                        members += ' ';
                    }
                    members += '\t' + data.player_name + '\n';
                }

                // Message sous forme d'embed
                const memberListEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Member List')
                    .setDescription(codeBlock(members));

                // Affichage des membres
                console.log('Command /team-members success.');
                await interaction.reply({ embeds: [memberListEmbed] });

            } catch (error) {
                console.error('Unable to find members', error);
                await interaction.reply('Unable to find members');
            }
        })();
	},
};