const axios = require('axios');
const { apiToken } = require('../config.json');
const { Sequelize } = require('sequelize');
const { EmbedBuilder } = require('discord.js');

const { dbRoute, environment, embedChannelID } = require('../config.json');
const { codeBlock } = require('discord.js');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

async function checkStatus(client) {
    // Team Tag Definition
    const team_tag = '2PVYQOOR';

    // Affichage de la date
    const date = new Date();
    console.log(date, 'CapitalRaids update.');

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
            const membersCount = res.data.items[0].members.length;

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
            const CapitalParticipants = require('../models/CapitalParticipants')(sequelize, Sequelize.DataTypes);

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
                        addRaidData(client, team_tag);
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
                            updateRaidData(client, team_tag);
                        }
                    }
                    // Cas où le raid est terminé et dans la BD
                    else if (count == 1 && state == 'ended') {
                        // Pour savoir si il reste des données à mettre à jour
                        const countParticipants = await CapitalParticipants.count({
                            where: {
                                clan_id: team_tag,
                                raid_date: currentRaidDate,
                            },
                            raw: true,
                        });
                        // Tout est à jour
                        if (membersCount == countParticipants) {
                            // Evènement terminé
                            console.log('No update needed.');
                        } else {
                            // Mise à jour du raid dans la base de données
                            console.log('Last update needed.');
                            updateRaidData(client, team_tag);
                        }
                    }
                    // Cas où le raid est terminé et non dans la BD
                    else {
                        // Ajout du raid à la base de données
                        addRaidData(client, team_tag);
                    }
                    try {
                        const channel = client.channels.cache.get('1033369410519445604');
                        await channel.send(codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'checkStatus: success.'));
                    } catch (error) {
                        console.error(error);
                    }
                } catch (error) {
                    try {
                        const channel = client.channels.cache.get('1033369410519445604');
                        await channel.send(codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'checkStatus: fail.'));
                    } catch (err) {
                        console.error(err);
                    }
                    console.error('Unable to count raids:', error);
                }
                try {
                    raidStatsEmbed(client, team_tag);
                } catch (error) {
                    console.log(error);
                }
            })();
        });
}

async function addRaidData(client, team_tag) {
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
                    try {
                        const channel = client.channels.cache.get('1033369410519445604');
                        await channel.send(codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'addRaidData: success.'));
                    } catch (error) {
                        console.error(error);
                    }
                } catch (error) {
                    try {
                        const channel = client.channels.cache.get('1033369410519445604');
                        await channel.send(codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'addRaidData: fail.'));
                    } catch (err) {
                        console.error(err);
                    }
                    console.error('Unable to add CapitalParticipants data:', error);
                }
            })();
        });
}

async function updateRaidData(client, team_tag) {
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
                        const count = await CapitalParticipants.count({
                            where: {
                                player_id: member.tag,
                                raid_date: currentRaidDate,
                            },
                            raw: true,
                        });
                        // Si le joueur est déjà renseigné dans la BD
                        if (count == 1) {
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
                        // Sinon, il faut l'ajouter
                        else {
                            await CapitalParticipants.create({
                                player_id: member.tag,
                                raid_date: currentRaidDate,
                                clan_id: team_tag,
                                points_count: member.capitalResourcesLooted,
                                attacks_count: member.attacks,
                                player_name: member.name,
                            });
                        }
                    }
                    try {
                        // Définition des salons
                        const channel = client.channels.cache.get('1033369410519445604');
                        await channel.send(codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'updateRaidData: success.'));
                    } catch (error) {
                        console.error(error);
                    }
                } catch (error) {
                    try {
                        // Définition des salons
                        const channel = client.channels.cache.get('1033369410519445604');
                        await channel.send(codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'updateRaidData: fail.'));
                    } catch (err) {
                        console.error(err);
                    }
                    console.error('Unable to update CapitalParticipants data:', error);
                }
            })();
        });
}

async function raidStatsEmbed(client, team_tag) {
    // Connexion à la base de données
    const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: dbRoute,
        freezeTableName: true,
    });

    // Connexion aux tables
    const CapitalParticipants = require('../models/CapitalParticipants')(sequelize, Sequelize.DataTypes);
    const Members = require('../models/Members')(sequelize, Sequelize.DataTypes);
    const Servers = require('../models/Servers.js')(sequelize, Sequelize.DataTypes);

    // Définition des salons
    const channel = client.channels.cache.get(embedChannelID);

    axios
    .get('https://api.clashofclans.com/v1/clans/%23' + team_tag + '/capitalraidseasons?limit=1', myConfig)
        .catch(error => {
            console.log(error);
        })
        .then(res => {
            const currentRaidDate = new Date(convertToISODate8601(res.data.items[0].startTime));
            const totalAttacks = res.data.items[0].totalAttacks;
            const raidsCompleted = res.data.items[0].raidsCompleted;

            (async () => {
                // On regarde pour la liste des membres du clans les résultats du dernier raid
                // Récupération données DB
                const queryAllMembers = await Members.findAll({
                    attributes: ['player_id', 'player_name'],
                    where: {
                        clan_id: team_tag,
                    },
                    raw: true,
                });
                // Recherche de tous les membres ayant participés au dernier RAID
                const queryAllParticipants = await CapitalParticipants.findAll({
                    attributes: ['player_id', 'points_count', 'attacks_count', 'player_name'],
                    where: {
                        raid_date: currentRaidDate,
                        clan_id: team_tag,
                    },
                    raw: true,
                });
                // For debugging purposes
                // console.log(queryAllMembers, queryAllParticipants);

                // On parcourt la liste des membres du clan
                // Initialisation variable
                const result = [];
                for (const clanMember of queryAllMembers) {
                    const clanMemberId = clanMember.player_id;
                    let exist = false;
                    for (const raidParticipant of queryAllParticipants) {
                        if (raidParticipant.player_id == clanMemberId) {
                            exist = true;
                            const memberData = {
                                player_id: raidParticipant.player_id,
                                player_name: raidParticipant.player_name,
                                attacks_count: raidParticipant.attacks_count,
                                points_count: raidParticipant.points_count,
                            };
                            result.push(memberData);
                        }
                    }
                    if (exist == false) {
                        const memberData = {
                            player_id: clanMember.player_id,
                            player_name: clanMember.player_name,
                            attacks_count: 0,
                            points_count: 0,
                        };
                        result.push(memberData);
                    }
                }
                // For debugging purposes
                // console.log(result);

                // Sort values
                result.sort((a, b) => b.points_count - a.points_count);

                // Converting JS object to string
                let strData = '';
                let pos = 1;
                strData += 'Pos' + '  ' + 'Name' + '                ' + 'Attacks' + '    ' + 'Points' + '\n';
                for (const member of result) {
                    strData += pos.toString() + '   ';
                    if (pos <= 9) {
                        strData += ' ';
                    }
                    strData += member.player_name;
                    for (let k = 0; k < 20 - member.player_name.length; k++) {
                        strData += ' ';
                    }
                    strData += member.attacks_count + '/6' + '        ';
                    strData += member.points_count + '\n';
                    pos++;
                }

                const raidInfoEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Capital Raid : ' + currentRaidDate.toLocaleDateString())
                    .setDescription(codeBlock(strData));

                // Regarder si c'est la première fois que le message est envoyé ou non
                const embedExist = await Servers.count({
                    where: {
                        clan_id: team_tag,
                        server_id: '1029684252075380736',
                    },
                    raw: true,
                });

                // Première fois
                if (embedExist == 0) {
                    channel.send({ embeds: [raidInfoEmbed] })
                        .then(data => {
                            (async () => {
                                console.log('Test');
                                await Servers.create({
                                    last_raid_info_embed_id: data.id.toString(),
                                    clan_id: team_tag,
                                    server_id: '1029684252075380736',
                                });
                            })();
                        })
                        .catch(console.error);
                }
                // Sinon, existe déjà
                else {
                    const queryEmbedID = await Servers.findAll({
                        attributes: ['last_raid_info_embed_id'],
                        where: {
                            clan_id: team_tag,
                            server_id: '1029684252075380736',
                        },
                        raw: true,
                    });
                    channel.messages.fetch(queryEmbedID[0].last_raid_info_embed_id)
                        .then(message => message.edit({ embeds: [raidInfoEmbed] }))
                        .catch(console.error);
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