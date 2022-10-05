module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Clans', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		clan_name: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: true,
	});
};