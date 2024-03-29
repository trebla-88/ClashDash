const axios = require('axios');
const { apiToken } = require('../config.json');
const { Sequelize } = require('sequelize');

const { dbRoute, token, environment } = require('../config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { codeBlock } = require('discord.js');

const myConfig = {
    headers: {
        Authorization: 'Bearer ' + apiToken,
    },
};

const rest = new REST({ version: '10' }).setToken(token);

async function deleteTheMembers() {
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

    // Affichage de la date
    const date = new Date();
    console.log(date);

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
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
                // Enregistrement des membres
                try {
                    const dbMembers = await Members.findAll({
                        where: {
                            clan_id: team_tag,
                        },
                    });
                    let noDelete = true;
                    for (const dbMember of dbMembers) {
                        let isInTheTeam = false;
                        for (const nowMember of res.data.memberList) {
                            if (dbMember.player_id == nowMember.tag) {
                                isInTheTeam = true;
                            }
                        }
                        if (isInTheTeam == false) {
                            noDelete = false;
                            deleteTheMember(dbMember.player_id);
                        }
                    }
                    if (noDelete == true) {
                        console.log('No deleted members.');
                    } else {
                        console.log('Members were deleted with success.');
                    }
                    try {
                        await rest.post(Routes.channelMessages('1033369410519445604'), {
                            body: {
                                content: codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'deleteTheMembers: success.'),
                            },
                        });
                    } catch (error) {
                        console.error(error);
                    }
                } catch (error) {
                    try {
                        await rest.post(Routes.channelMessages('1033369410519445604'), {
                            body: {
                                content: codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'deleteTheMembers: fail.'),
                            },
                        });
                    } catch (err) {
                        console.error(err);
                    }
                    console.error('Error:', error);
                }
            })();
        });
}

async function deleteTheMember(playerId) {
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

    (async () => {
        try {
            await sequelize.authenticate();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

        try {
            Members.destroy({
                where: {
                    player_id: playerId,
                },
            });
            console.log(`Member with id ${playerId} was deleted from the database.`);
        } catch (error) {
            console.error('Unable to destroy data of the database:', error);
        }
    })();
}

module.exports = {
    deleteTheMembers,
};