const axios = require('axios');
const { apiToken } = require('../config.json');
const { Sequelize } = require('sequelize');
const { dbRoute } = require('../config.json');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

async function checkStatus() {
    // Team Tag Definition
    const team_tag = '2PVYQOOR';

    // Affichage de la date
    const date = new Date();
    console.log(date);

    /*
    // Initialization currentRaidDate
    let currentRaidDate;
    let state;
    let capitalTotalLoot;
    */

    // Recherche sur l'API de currentRaidDate
    axios
        .get('https://api.clashofclans.com/v1/clans/%23' + team_tag + '/capitalraidseasons?limit=1', myConfig)
        .catch(error => {
            console.log(error);
        })
        .then(res => {
            const currentRaidDate = new Date(convertToISODate8601(res.data.items[0].startTime));
            const state = res.data.items[0].state;
            const capitalTotalLoot = res.data.items[0].capitalTotalLoot;

            // For debugging purposes
            // console.log(currentRaidDate, state);

            // Connexion à la base de données
            const sequelize = new Sequelize('database', 'username', 'password', {
                host: 'localhost',
                dialect: 'sqlite',
                logging: false,
                storage: dbRoute,
                freezeTableName: true,
            });

            // Connexion aux tables
            const Capitals = require('../models/Capitals')(sequelize, Sequelize.DataTypes);

            // Requête pour chercher la date du dernier Raid dans la BD
            (async () => {
                try {
                    await sequelize.authenticate();
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
                try {
                    const count = await Capitals.count({
                        where: {
                            clan_id: team_tag,
                            raid_date: currentRaidDate,
                        },
                        raw: true,
                    });

                    // For debugging purposes
                    // console.log(team_tag, currentRaidDate, state, count);

                    // Cas où le raid vient juste de commencer
                    if (count == 0 && state != 'ended') {
                        // Ajout du raid à la base de données
                        addRaidData(team_tag);
                    }
                    // Cas où le raid est déjà dans la BD et est en cours
                    else if (count == 1 && state != 'ended') {
                        // Pour savoir si il reste des données à mettre à jour
                        const query = await Capitals.findAll({
                            attributes: ['total_points_count'],
                            where: {
                                clan_id: team_tag,
                                raid_date: currentRaidDate,
                            },
                            raw: true,
                        });
                        // Tout est à jour
                        if (capitalTotalLoot == query[0].total_points_count) {
                            // Evènement terminé
                            console.log('No update needed.');
                        } else {
                            // Mise à jour du raid dans la base de données
                            console.log('Update needed.');
                            updateRaidData(team_tag);
                        }
                    }
                    // Cas où le raid est terminé et dans la BD
                    else if (count == 1 && state == 'ended') {
                        // Pour savoir si il reste des données à mettre à jour
                        const query = await Capitals.findAll({
                            attributes: ['total_points_count'],
                            where: {
                                clan_id: team_tag,
                                raid_date: currentRaidDate,
                            },
                            raw: true,
                        });
                        // Tout est à jour
                        if (capitalTotalLoot == query[0].total_points_count) {
                            // Evènement terminé
                            console.log('No update needed.');
                        }
                        // Il reste une dernière mise à jour à faire
                        else {
                            // Mise à jour du raid dans la base de données
                            console.log('Last update needed.');
                            updateRaidData(team_tag);
                        }
                    }
                    // Cas où le raid est terminé et non dans la BD
                    else {
                        // Ajout du raid à la base de données
                        addRaidData(team_tag);
                    }
                } catch (error) {
                    console.error('Unable to count raids:', error);
                }
            })();
        });
}

async function addRaidData(team_tag) {
    // Connexion à la base de données
    const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: dbRoute,
        freezeTableName: true,
    });

    // Connexion aux tables
    const Capitals = require('../models/Capitals')(sequelize, Sequelize.DataTypes);
    const CapitalParticipants = require('../models/CapitalParticipants')(sequelize, Sequelize.DataTypes);

    /*
    // Initialization currentRaidDate
    let currentRaidDate;
    let members;
    let capitalTotalLoot;
    */

    // Recherche sur l'API de currentRaidDate
    axios
    .get('https://api.clashofclans.com/v1/clans/%23' + team_tag + '/capitalraidseasons?limit=1', myConfig)
        .catch(error => {
            console.log(error);
        })
        .then(res => {
            const currentRaidDate = new Date(convertToISODate8601(res.data.items[0].startTime));
            const members = res.data.items[0].members;
            const capitalTotalLoot = res.data.items[0].capitalTotalLoot;

            // Requête pour ajouter le dernier Raid dans la BD
            (async () => {
                try {
                    await sequelize.authenticate();
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
                try {
                    await Capitals.create({
                        raid_date: currentRaidDate,
                        clan_id: team_tag,
                        total_points_count: capitalTotalLoot,
                    });
                } catch (error) {
                    console.error('Unable to add Capitals data:', error);
                }
                try {
                    for (const member of members) {
                        await CapitalParticipants.create({
                            player_id: member.tag,
                            raid_date: currentRaidDate,
                            clan_id: team_tag,
                            points_count: member.capitalResourcesLooted,
                            attacks_count: member.attacks,
                            player_name: member.name,
                        });
                    }
                } catch (error) {
                    console.error('Unable to add CapitalParticipants data:', error);
                }
            })();
        });
}

async function updateRaidData(team_tag) {
    // Connexion à la base de données
    const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: dbRoute,
        freezeTableName: true,
    });

    // Connexion aux tables
    const Capitals = require('../models/Capitals')(sequelize, Sequelize.DataTypes);
    const CapitalParticipants = require('../models/CapitalParticipants')(sequelize, Sequelize.DataTypes);

    /*
    // Initialization currentRaidDate
    let currentRaidDate;
    let members;
    let capitalTotalLoot;
    */

    // Recherche sur l'API de currentRaidDate
    axios
    .get('https://api.clashofclans.com/v1/clans/%23' + team_tag + '/capitalraidseasons?limit=1', myConfig)
        .catch(error => {
            console.log(error);
        })
        .then(res => {
            const currentRaidDate = new Date(convertToISODate8601(res.data.items[0].startTime));
            const members = res.data.items[0].members;
            const capitalTotalLoot = res.data.items[0].capitalTotalLoot;

            // Requête pour ajouter le dernier Raid dans la BD
            (async () => {
                try {
                    await sequelize.authenticate();
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
                try {
                    await Capitals.update({
                        total_points_count: capitalTotalLoot,
                    }, {
                        where: {
                            raid_date: currentRaidDate,
                            clan_id: team_tag,
                        },
                    });
                } catch (error) {
                    console.error('Unable to update Capitals data:', error);
                }
                try {
                    for (const member of members) {
                        await CapitalParticipants.update({
                            points_count: member.capitalResourcesLooted,
                            attacks_count: member.attacks,
                            player_name: member.name,
                        }, {
                            where: {
                                player_id: member.tag,
                                raid_date: currentRaidDate,
                                clan_id: team_tag,
                            },
                        });
                    }
                } catch (error) {
                    console.error('Unable to update CapitalParticipants data:', error);
                }
            })();
        });
}

function convertToISODate8601(strDate) {
    const arrayDateISO = [];
    arrayDateISO.push(strDate[0]);
    arrayDateISO.push(strDate[1]);
    arrayDateISO.push(strDate[2]);
    arrayDateISO.push(strDate[3]);
    arrayDateISO.push('-');
    arrayDateISO.push(strDate[4]);
    arrayDateISO.push(strDate[5]);
    arrayDateISO.push('-');
    arrayDateISO.push(strDate[6]);
    arrayDateISO.push(strDate[7]);
    arrayDateISO.push(strDate[8]);
    arrayDateISO.push(strDate[9]);
    arrayDateISO.push(strDate[10]);
    arrayDateISO.push(':');
    arrayDateISO.push(strDate[11]);
    arrayDateISO.push(strDate[12]);
    arrayDateISO.push(':');
    arrayDateISO.push(strDate[13]);
    arrayDateISO.push(strDate[14]);
    arrayDateISO.push(strDate[15]);
    arrayDateISO.push(strDate[16]);
    arrayDateISO.push(strDate[17]);
    arrayDateISO.push(strDate[18]);
    arrayDateISO.push(strDate[19]);

    let dateISO = '';
    for (const elem of arrayDateISO) {
        dateISO += elem;
    }
    return dateISO;
}

module.exports = {
    checkStatus,
};