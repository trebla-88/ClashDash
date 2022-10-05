module.exports = (sequelize, DataTypes) => {
	return sequelize.define('ClanGamesParticipants', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        player_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        clangames_date: {
			type: DataTypes.DATE,
			primaryKey: true,
		},
		gamepoints_count: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};