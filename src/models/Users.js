import { USER_ROLE_USER } from '../enums/role';
import { USER_STATUS_ACTIVE } from '../enums/status';

export default (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Such user name is already registered',
      },
      validate: {
        notEmpty: {
          args: true,
          msg: 'User name cannot be empty',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Such email is already registered',
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid email format',
        },
        notEmpty: {
          args: true,
          msg: 'Email cannot be empty',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Password cannot be empty',
        },
        len: {
          args: 8,
          msg: 'Minimum 8 characters required in password',
        },
      },
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: USER_STATUS_ACTIVE,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Status cannot be empty',
        },
      },
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: USER_ROLE_USER,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Role cannot be empty',
        },
      },
    },
  });

  Users.associate = (models) => {
    // associations can be defined here
    Users.hasMany(models.Todos, { onDelete: 'cascade', onUpdate: 'cascade' });
    Users.belongsTo(models.Tokens);
    Users.belongsTo(models.UserContacts);
  };

  return Users;
};
