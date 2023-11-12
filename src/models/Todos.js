module.exports.default = (sequelize, DataTypes) => {
  const Todos = sequelize.define('Todos', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Text cannot be empty',
        },
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  Todos.associate = (models) => {
    // associations can be defined here
    Todos.belongsTo(models.Users);
  };

  return Todos;
};
