module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Wars', {
		war_date: {
			type: DataTypes.DATE,
			primaryKey: true,
		},
        clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		opponent_clan_id: {
			type: DataTypes.STRING,
		},
        opponent_clan_name: {
			type: DataTypes.STRING,
		},
        war_state: {
			type: DataTypes.STRING,
		},
        opponent_clan_level: {
			type: DataTypes.INTEGER,
		},
        our_star_count: {
			type: DataTypes.INTEGER,
		},
        our_attack_count: {
			type: DataTypes.INTEGER,
		},
        opponent_star_count: {
			type: DataTypes.INTEGER,
		},
        opponent_attack_count: {
			type: DataTypes.INTEGER,
		},
		attack_destruction_percentage: {
			type: DataTypes.INTEGER,
		},
		defense_destruction_percentage: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};