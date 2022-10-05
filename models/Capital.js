module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Capital', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        raid_date: {
			type: DataTypes.DATE,
			primaryKey: true,
		},
		total_points_count: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};