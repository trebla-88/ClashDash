module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Stats', {
        stats_date: {
            type: DataTypes.DATE,
            primaryKey: true,
        },
		player_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		trophies_count: {
            type: DataTypes.INTEGER,
        },
		star_count: {
            type: DataTypes.INTEGER,
        },
		donations_count: {
            type: DataTypes.INTEGER,
        },
		contributions_count: {
            type: DataTypes.INTEGER,
        },
	}, {
		timestamps: false,
	});
};