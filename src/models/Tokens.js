export default (sequelize, DataTypes) => {
  const Tokens = sequelize.define('Tokens', {
    tokenId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Tokens.associate = (models) => {
    // associations can be defined here
    Tokens.hasOne(models.Users, { onDelete: 'cascade', onUpdate: 'cascade' });
  };

  return Tokens;
};
