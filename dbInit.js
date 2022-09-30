const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
    freezeTableName: true,
});

const Teams = require('./models/Teams.js')(sequelize, Sequelize.DataTypes);
const Members = require('./models/Members.js')(sequelize, Sequelize.DataTypes);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    await Teams.sync({ force: true });
    await Members.sync({ force: true });
    console.log('Database Initialization Successful');
    sequelize.close();
})();