module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Members', {
		player_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		player_name: {
			type: DataTypes.STRING,
		},
        player_discord: {
			type: DataTypes.STRING,
            unique: true,
		},
        clan_id: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};