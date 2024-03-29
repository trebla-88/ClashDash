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

async function addTheMembers() {
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
                    let newMemberAmount = 0;
                    for (const member of res.data.memberList) {
                        // Check if the player is already registered
                        const exist = await Members.count({
                            where: {
                                player_id: member.tag,
                            },
                        });
                        // Register the player if not already regitered
                        if (exist == 0) {
                            newMemberAmount++;
                            await Members.create({
                                player_id: member.tag,
                                player_name: member.name,
                                clan_id: team_tag,
                            });
                        }
                    }
                    if (newMemberAmount == 1) {
                        console.log(`${newMemberAmount} member was added successfully.`);
                    } else if (newMemberAmount > 1) {
                        console.log(`${newMemberAmount} members were added successfully.`);
                    } else {
                        console.log('No new members.');
                    }
                    try {
                        await rest.post(Routes.channelMessages('1033369410519445604'), {
                            body: {
                                content: codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'addTheMembers: success.'),
                            },
                        });
                    } catch (error) {
                        console.error(error);
                    }
                } catch (error) {
                    try {
                        await rest.post(Routes.channelMessages('1033369410519445604'), {
                            body: {
                                content: codeBlock('js', '[' + environment + ']' + '[' + new Date().toLocaleString() + ']: ' + 'addTheMembers: fail.'),
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

module.exports = {
    addTheMembers,
};