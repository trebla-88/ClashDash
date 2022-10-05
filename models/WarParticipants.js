module.exports = (sequelize, DataTypes) => {
	return sequelize.define('WarParticipants', {
		war_date: {
			type: DataTypes.DATE,
			primaryKey: true,
		},
        clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        player_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		attack_count: {
			type: DataTypes.INTEGER,
		},
        star_count: {
			type: DataTypes.INTEGER,
		},
        attack_destruction_percentage: {
            type: DataTypes.INTEGER,
        },
        defense_destruction_percentage: {
            type: DataTypes.INTEGER,
        },
        defense_star_count: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};