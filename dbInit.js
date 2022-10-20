const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
    freezeTableName: true,
});

const Capital = require('./models/Capitals.js')(sequelize, Sequelize.DataTypes);
const CapitalParticipants = require('./models/CapitalParticipants.js')(sequelize, Sequelize.DataTypes);
const ClanGames = require('./models/ClanGames.js')(sequelize, Sequelize.DataTypes);
const ClanGamesParticipants = require('./models/ClanGamesParticipants.js')(sequelize, Sequelize.DataTypes);
const Clans = require('./models/Clans.js')(sequelize, Sequelize.DataTypes);
const ClanWarLeagues = require('./models/ClanWarLeagues.js')(sequelize, Sequelize.DataTypes);
const ClanWarLeaguesRounds = require('./models/ClanWarLeaguesRounds.js')(sequelize, Sequelize.DataTypes);
const Members = require('./models/Members.js')(sequelize, Sequelize.DataTypes);
const Stats = require('./models/Stats.js')(sequelize, Sequelize.DataTypes);
const WarParticipants = require('./models/WarParticipants.js')(sequelize, Sequelize.DataTypes);
const Wars = require('./models/Wars.js')(sequelize, Sequelize.DataTypes);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    // FK
    /*
    Members.hasMany(Stats);
    Stats.belongsTo(Members);
    */

    // Sync
    await Capital.sync({
        // force: true,
    });
    await CapitalParticipants.sync({
        // force: true,
    });
    await ClanGames.sync();
    await ClanGamesParticipants.sync();
    await Clans.sync();
    await ClanWarLeagues.sync();
    await ClanWarLeaguesRounds.sync();
    await Members.sync();
    await Stats.sync({
        // force: true,
    });
    await WarParticipants.sync();
    await Wars.sync();

    console.log('Database Initialization Successful.');
    sequelize.close();
})();