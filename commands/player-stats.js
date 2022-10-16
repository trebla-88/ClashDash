const { SlashCommandBuilder } = require('discord.js');
const { Sequelize, Op } = require('sequelize');
const { dbRoute } = require('../config.json');
const QuickChart = require('quickchart-js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player-stats')
		.setDescription('Montre les stats d\' un joueur!')
        .addStringOption(option =>
            option.setName('player-tag')
                .setDescription('Player Tag of the member.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Stats category.')
                .setRequired(true)
                .addChoices(
                    { name: 'Trophies', value: 'trophies' },
                    { name: 'War Stars', value: 'stars' },
                    { name: 'Donations', value: 'donations' },
                    { name: 'Contributions', value: 'contributions' },
                ))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time range.')
                .setRequired(true)
                .addChoices(
                    { name: 'Day', value: 'day' },
                    { name: 'Week', value: 'week' },
                    { name: 'Month', value: 'month' },
                    { name: 'Year', value: 'year' },
                    { name: 'All Time', value: 'all-time' },
                )),
	async execute(interaction) {
        // Connexion à la base de données
        const sequelize = new Sequelize('database', 'username', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: dbRoute,
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

        // Récupération options
        const player_tag = interaction.options.getString('player-tag');
        const category = interaction.options.getString('category');
        const time = interaction.options.getString('time');

        // For debugging purposes
        // console.log(player_tag, category, time);

        // Choix des attributs
        const atr = ['stats_date'];
        switch (category) {
            case 'trophies':
                atr.push('trophies_count');
                break;
            case 'stars':
                atr.push('star_count');
                break;
            case 'donations':
                atr.push('donations_count');
                break;
            case 'contributions':
                atr.push('contributions_count');
                break;
        }

        // For debugging purposes
        // console.log(atr);

        let date = new Date();

        // Choix de la date pour intervalle
        switch (time) {
            case 'day':
                date = new Date(new Date() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                date = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                date = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                date = new Date(new Date() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'all-time':
                date = new Date(new Date() - 10 * 365 * 24 * 60 * 60 * 1000);
                break;
        }

        // Récupération données DB
        const query = await Stats.findAll({
            attributes: atr,
            where: {
                player_id: player_tag,
                stats_date: {
                    [Op.lt]: new Date(),
                    [Op.gt]: date,
                },
            },
            raw: true,
        });

        // Debugging purposes
        // console.log(query);
        // console.log(player_tag, date, category, time);

        // Raccourcissement de la liste
        let querySmall = [];
        switch (time) {
            case 'day':
                for (const elem of query) {
                    elem.stats_date = elem.stats_date.slice(11, 16);
                }
                querySmall = query.slice();
                break;
            case 'week':
                for (const elem of query) {
                    if (querySmall.length == 0) {
                        elem.stats_date = new Date(elem.stats_date).getDate();
                        querySmall.push(elem);
                    } else if (querySmall.slice(-1)[0].stats_date != new Date(elem.stats_date).getDate()) {
                        elem.stats_date = new Date(elem.stats_date).getDate();
                        querySmall.push(elem);
                    }
                }
                break;
            case 'month':
                for (const elem of query) {
                    if (querySmall.length == 0) {
                        elem.stats_date = new Date(elem.stats_date).getDate();
                        querySmall.push(elem);
                    } else if (querySmall.slice(-1)[0].stats_date != new Date(elem.stats_date).getDate()) {
                        elem.stats_date = new Date(elem.stats_date).getDate();
                        querySmall.push(elem);
                    }
                }
                break;
            case 'year':
                for (const elem of query) {
                    if (querySmall.length == 0) {
                        elem.stats_date = new Date(elem.stats_date).getMonth();
                        querySmall.push(elem);
                    } else if (querySmall.slice(-1)[0].stats_date != new Date(elem.stats_date).getMonth()) {
                        elem.stats_date = new Date(elem.stats_date).getMonth();
                        querySmall.push(elem);
                    }
                }
                break;
            case 'all-time':
                for (const elem of query) {
                    if (querySmall.length == 0) {
                        elem.stats_date = new Date(elem.stats_date).getFullYear();
                        querySmall.push(elem);
                    } else if (querySmall.slice(-1)[0].stats_date != new Date(elem.stats_date).getFullYear()) {
                        elem.stats_date = new Date(elem.stats_date).getFullYear();
                        querySmall.push(elem);
                    }
                }
                break;
        }

        // Définition des listes
        const dates = [];
        const data = [];

        switch (category) {
            case 'trophies':
                for (const stat of querySmall) {
                    dates.push(stat.stats_date);
                    data.push(stat.trophies_count);
                }
                break;
            case 'stars':
                for (const stat of querySmall) {
                    dates.push(stat.stats_date);
                    data.push(stat.star_count);
                }
                break;
            case 'donations':
                for (const stat of querySmall) {
                    dates.push(stat.stats_date);
                    data.push(stat.donations_count);
                }
                break;
            case 'contributions':
                for (const stat of querySmall) {
                    dates.push(stat.stats_date);
                    data.push(stat.contributions_count);
                }
                break;
        }

        // Debugging purposes
        // console.log(dates, data);

        const chart = new QuickChart();

        chart.setVersion('3');

        chart.setConfig({
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: category,
                    data: data,
                    fill: false,
                    tension: 0.3,
                    borderColor: '#cc65fe',
                }],
            },
            options: {
                scales: {
                    y: {
                        suggestedMin: Math.min(data),
                        suggestedMax: Math.max(data),
                    },
                },
            },
        });

        chart.setBackgroundColor('rgba(0, 0, 0, 0)');

        // Debugging purposes
        // console.log(chartUrl);

        console.log('Command /player-stats success.');
		return interaction.reply(chart.getUrl());
	},
};