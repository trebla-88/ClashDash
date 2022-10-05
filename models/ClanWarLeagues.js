module.exports = (sequelize, DataTypes) => {
	return sequelize.define('ClanWarLeagues', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        season: {
            type: DataTypes.DATE,
            primaryKey: true,
        },
		state: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};