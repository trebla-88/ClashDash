const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const { Sequelize, Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player-stats')
		.setDescription('Montre les stats d\' un joueur!'),
	async execute(interaction) {
        // Connexion à la base de données
        const sequelize = new Sequelize('database', 'username', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: '/home/trebla/ZDEV/discord/clashdash/database.sqlite',
            freezeTableName: true,
        });

        // Connexion aux tables
        const Stats = require('../models/Stats')(sequelize, Sequelize.DataTypes);

        // Vérification connexion
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

        // Récupération données DB
        const query = await Stats.findAll({
            attributes: ['stats_date', 'trophies_count'],
            where: {
                player_id: '2PRJVLY29',
                stats_date: {
                    [Op.gt]: '2022-10-09 22:13:17',
                },
            },
            raw: true,
        });

        // Debugging purposes
        // console.log(query);

        // Raccourcissemnt de la liste
        const querySmall = query.slice(-10);

        // Définition des listes
        const dates = [];
        const trophies = [];

        for (const stat of querySmall) {
            dates.push(stat.stats_date.slice(11, 19));
            trophies.push(stat.trophies_count);
        }

        console.log(dates, trophies);

        const chart = {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Trophées',
                    data: trophies,
                }],
            },
        };

        const encodedChart = encodeURIComponent(JSON.stringify(chart));

        const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;

        console.log(chartUrl);

		return interaction.reply(chartUrl);
	},
};