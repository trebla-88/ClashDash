module.exports = (sequelize, DataTypes) => {
	return sequelize.define('CapitalParticipants', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        raid_date: {
			type: DataTypes.DATE,
			primaryKey: true,
		},
        player_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		points_count: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};