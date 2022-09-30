module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Teams', {
		team_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		team_name: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};