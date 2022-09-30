const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { apiToken } = require('../config.json');
const { Sequelize } = require('sequelize');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register-team')
		.setDescription('Enregistre ton clan dans la base de données!')
        .addStringOption(option =>
            option.setName('team-tag')
                .setDescription('Team Tag of the Team you want to register.')
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
        const Teams = require('../models/Teams')(sequelize, Sequelize.DataTypes);

        // Connexion API
        axios
            .get('https://api.clashofclans.com/v1/clans/%23' + team_tag, myConfig)
            .catch(error => {
                console.log(error);
            })
            .then(res => {
                (async () => {
                    try {
                        await sequelize.authenticate();
                        console.log('Connection has been established successfully.');
                    } catch (error) {
                        console.error('Unable to connect to the database:', error);
                    }
                    // Enregistrement du clan
                    try {
                        await Teams.create({
                            team_id: team_tag,
                            team_name: res.data.name,
                            });
                        console.log('Team was added successfully.');
                        await interaction.reply('Team was added successfully.');
                    } catch (error) {
                        console.error('Unable to insert the team data to the database:', error);
                        await interaction.reply('Unable to insert the team data to the database.');
                    }
                    // Enregistrement des membres
                    try {
                        for (const member of res.data.memberList) {
                            await Members.create({
                                player_id: member.tag,
                                player_name: member.name,
                                player_team_tag: team_tag,
                            });
                        }
                        console.log('Members were added successfully.');
                        await interaction.followUp('Members were added successfully.');
                    } catch (error) {
                        console.error('Unable to add the members of the team to the database:', error);
                        await interaction.followUp('Unable to add the members of the team to the database.');
                    }
                })();
            });

        // return interaction.reply('Votre clan a bien été enregistré.');
	},
};