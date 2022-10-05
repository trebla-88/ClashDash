module.exports = (sequelize, DataTypes) => {
	return sequelize.define('ClanGames', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        clangames_date: {
			type: DataTypes.DATE,
			primaryKey: true,
		},
		total_gamepoints_count: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};