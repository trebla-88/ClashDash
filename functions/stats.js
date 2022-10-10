const axios = require('axios');
const { apiToken } = require('../config.json');
const { Sequelize } = require('sequelize');
const { dbRoute } = require('../config.json');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

async function updateStats() {
    // Team Tag Definition
    const team_tag = '2PVYQOOR';

    // Connexion à la base de données
    const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: dbRoute,
        freezeTableName: true,
    });

    // Connexion aux tables
    const Members = require('../models/Members')(sequelize, Sequelize.DataTypes);
    const Stats = require('../models/Stats')(sequelize, Sequelize.DataTypes);

    // Affichage de la date
    const date = new Date();
    console.log(date, 'Récupération des statistiques.');

    // Requête pour chercher l'identifiant de chaque joueur du clan
    (async () => {
        try {
            await sequelize.authenticate();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
        try {
            const query = await Members.findAll({
                attributes: ['player_id'],
                where: {
                    clan_id: team_tag,
                },
                raw: true,
            });
            // Debugging purposes
            // console.log(query);

            for (const memberData of query) {
                // Player_id
                const player_id = memberData.player_id.slice(1);
                // console.log(player_id);
                // Connexion API
                axios
                .get('https://api.clashofclans.com/v1/players/%23' + player_id, myConfig)
                .catch(error => {
                    console.log(error);
                })
                .then(res => {
                    (async () => {
                        // Enregistrement des stats
                        try {
                            await Stats.create({
                                stats_date: date,
                                player_id: player_id,
                                trophies_count: res.data.trophies,
                                versus_trophies_count: res.data.versusTrophies,
                                star_count: res.data.warStars,
                                donations_count: res.data.donations,
                                contributions_count: res.data.clanCapitalContributions,
                            });
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    })();
                });
            }

        } catch (error) {
            console.error('Error:', error);
        }
    })();
}

module.exports = {
    updateStats,
};