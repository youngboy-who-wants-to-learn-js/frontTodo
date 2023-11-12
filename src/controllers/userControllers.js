import sequelize from 'sequelize';
import { ALL_USER_ROLES } from '../enums/role';
import { SOCKET_USERS_EVENTS } from '../enums/socketEvents';
import { ALL_USER_STATUS } from '../enums/status';
import { UserContacts, Users } from '../models';

const getAllUsersController = async (req, res) => {
  const { userId } = req.user;

  try {
    const users = await Users.findAll({
      include: [
        {
          model: UserContacts,
        },
      ],
      where: { id: { [sequelize.Op.not]: userId } },
    });
    res.status(200).json({
      data: users,
      status: 200,
    });
  } catch (e) {
    res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};

const assignRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const role = +req.params.role;
    if (!ALL_USER_ROLES.includes(role)) {
      res.status(400).json({
        message: 'Such a role does not exist',
        status: 400,
      });
      return;
    }
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      res.status(400).json({
        message: 'No such user exists',
        status: 400,
      });
      return;
    }

    await Users.update({ role }, { where: { id } });
    const updatedUser = await Users.findOne({ where: { id } });
    const result = { id: updatedUser.id, role: updatedUser.role };

    res.sendSocketEvent({
      type: SOCKET_USERS_EVENTS.assignRole,
      payload: result,
    });
    res.status(200).json({
      data: result,
      status: 200,
    });
  } catch (e) {
    res.status(400).json({
      message: e.message,
      status: 400,
    });
  }
};

const setUserStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const status = +req.params.status;
    if (!ALL_USER_STATUS.includes(status)) {
      res.status(400).json({
        message: 'Such a status does not exist',
        status: 400,
      });
      return;
    }
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      res.status(400).json({
        message: 'No such user exists',
        status: 400,
      });
      return;
    }

    await Users.update({ status }, { where: { id } });
    const updatedUser = await Users.findOne({ where: { id } });
    const result = { id: updatedUser.id, status: updatedUser.status };

    res.sendSocketEvent({
      type: SOCKET_USERS_EVENTS.userStatus,
      payload: result,
    });
    res.status(200).json({
      data: result,
      status: 200,
    });
  } catch (e) {
    res.status(400).json({
      message: e.message,
      status: 400,
    });
  }
};

export { getAllUsersController, assignRoleController, setUserStatusController };
