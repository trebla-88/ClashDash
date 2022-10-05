module.exports = (sequelize, DataTypes) => {
	return sequelize.define('ClanWarLeaguesRounds', {
		clan_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        season: {
            type: DataTypes.DATE,
            primaryKey: true,
        },
        opponent_clan_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        opponent_clan_name: {
            type: DataTypes.STRING,
        },
		war_state: {
			type: DataTypes.STRING,
		},
        our_star_count: {
			type: DataTypes.INTEGER,
		},
        opponent_clan_level: {
			type: DataTypes.INTEGER,
		},
        opponent_star_count: {
			type: DataTypes.INTEGER,
		},
        our_attack_count: {
			type: DataTypes.INTEGER,
		},
        opponent_attack_count: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};