module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Members', {
		player_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		player_name: {
			type: DataTypes.STRING,
            unique: false,
		},
        player_discord: {
			type: DataTypes.STRING,
            unique: true,
		},
        player_team_tag: {
			type: DataTypes.STRING,
            unique: false,
		},
	}, {
		timestamps: false,
	});
};