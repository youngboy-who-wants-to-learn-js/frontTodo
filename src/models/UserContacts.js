export default (sequelize, DataTypes) => {
  const UserContacts = sequelize.define('UserContacts', {
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Address name cannot be empty',
        },
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Age cannot be empty',
        },
        min: 16,
        max: 99,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Age cannot be empty',
        },
        is: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/g,
      },
    },
  });

  UserContacts.associate = (models) => {
    // associations can be defined here
    UserContacts.hasOne(models.Users, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  };

  return UserContacts;
};
