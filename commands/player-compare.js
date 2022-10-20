const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { apiToken } = require('../config.json');
const QuickChart = require('quickchart-js');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player-compare')
		.setDescription('Compare des joueurs entre eux!')
        .addStringOption(option =>
            option.setName('player-tag-1')
                .setDescription('Player Tag of the member.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('player-tag-2')
                .setDescription('Player Tag of the member.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('player-tag-3')
                .setDescription('Player Tag of the member.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('player-tag-4')
                .setDescription('Player Tag of the member.')
                .setRequired(false)),
	async execute(interaction) {

        // Reach player tags
        const player_tag_1 = interaction.options.getString('player-tag-1');
        const player_tag_2 = interaction.options.getString('player-tag-2');
        const player_tag_3 = interaction.options.getString('player-tag-3');
        const player_tag_4 = interaction.options.getString('player-tag-4');

        const player_tags = [player_tag_1];
        if (player_tag_2 != null) {
            player_tags.push(player_tag_2);
        }
        if (player_tag_3 != null) {
            player_tags.push(player_tag_3);
        }
        if (player_tag_4 != null) {
            player_tags.push(player_tag_4);
        }

        // Initialize arrays
        const player_name = [];
        const player_trophies = [];
        const player_warStars = [];
        const player_versusTrophies = [];
        const player_clanCapitalContributions = [];
        const player_donations = [];
        const player_heroes = [];

        for (const player_tag of player_tags) {
            const promiseOne = new Promise((resolve) => {
                axios
                    .get('https://api.clashofclans.com/v1/players/%23' + player_tag, myConfig)
                    .then(res => {
                        // Player Name
                        player_name.push(res.data.name);
                        // Trophies
                        let trophies = res.data.trophies;
                        if (trophies >= 5000) {
                            trophies = 100;
                        } else {
                            trophies = trophies / 5000 * 100;
                        }
                        player_trophies.push(trophies);
                        // War stars
                        const warStars = res.data.warStars;
                        player_warStars.push(warStars);
                        // Versus trophies
                        let versusTrophies = res.data.versusTrophies;
                        if (versusTrophies >= 5000) {
                            versusTrophies = 100;
                        } else {
                            versusTrophies = versusTrophies / 5000 * 100;
                        }
                        player_versusTrophies.push(versusTrophies);
                        // Clan Capital Contributions
                        const clanCapitalContributions = res.data.clanCapitalContributions;
                        player_clanCapitalContributions.push(clanCapitalContributions);
                        // Donations
                        const donations = res.data.achievements[14].value;
                        player_donations.push(donations);
                        // Heroes
                        let heroes = 0;
                        for (const hero of res.data.heroes) {
                            heroes += hero.level;
                        }
                        heroes = heroes / 375 * 100;
                        player_heroes.push(heroes);
                        resolve();
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });
            // Wait for promise
            try {
                await promiseOne;
            } catch (error) {
                console.log(error);
            }
        }
        const max_warStars = Math.max.apply(Math, player_warStars);
        for (let i = 0; i < player_warStars.length; i++) {
            player_warStars[i] = player_warStars[i] / max_warStars * 100;
        }
        const max_clanCapitalContributions = Math.max.apply(Math, player_clanCapitalContributions);
        for (let j = 0; j < player_clanCapitalContributions.length; j++) {
            player_clanCapitalContributions[j] = player_clanCapitalContributions[j] / max_clanCapitalContributions * 100;
        }
        const max_donations = Math.max.apply(Math, player_donations);
        for (let i = 0; i < player_donations.length; i++) {
            player_donations[i] = player_donations[i] / max_donations * 100;
        }

        // Initialize colors
        const borderColors = [
            'rgba(142, 68, 173, 0.3)',
            'rgba(40, 116, 166, 0.3)',
            'rgba(34, 153, 84, 0.3)',
            'rgba(236, 112, 99, 0.3)',
        ];

        // Initialize colors
        const bckColors = [
            'rgba(142, 68, 173, 0.1)',
            'rgba(40, 116, 166, 0.1)',
            'rgba(34, 153, 84, 0.1)',
            'rgba(236, 112, 99, 0.1)',
        ];

        // Datasets
        const datasets = [];
        for (let i = 0; i < player_tags.length; i++) {
            datasets.push({
                label: player_name[i],
                data: [
                        player_trophies[i],
                        player_warStars[i],
                        player_versusTrophies[i],
                        player_clanCapitalContributions[i],
                        player_donations[i],
                        player_heroes[i],
                    ],
                fill: true,
                borderColor: borderColors[i],
                backgroundColor: bckColors[i],
            });
        }

        // Debugging Purposes
        // console.log('playerTrophiesList', player_trophies);
        // console.log('datasets', datasets);

        // Output
        const chart = new QuickChart();

        chart.setVersion('3');

        chart.setConfig({
            type: 'radar',
            data: {
                labels: ['Trophies', 'WarStars', 'VersusTrophies', 'Capital Contributions', 'Donations', 'Heroes'],
                datasets: datasets,
            },
            options: {
                elements: {
                    line: {
                      borderWidth: 3,
                    },
                },
                scale: {
                    min: 0,
                    max: 100,
                },
            },
        });

        // chart.setBackgroundColor('rgba(0, 0, 0, 0)');

        // Debugging purposes
        // console.log(chartUrl);

        console.log('Command /player-compare success.');
		return interaction.reply(chart.getUrl());
	},
};