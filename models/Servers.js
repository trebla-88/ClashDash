module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Servers', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		server_id: {
			type: DataTypes.STRING,
            primaryKey: true,
		},
        last_raid_info_embed_id: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};