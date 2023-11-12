import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { USER_STATUS_INACTIVE } from '../enums/status';
// import { Tokens, UserContacts, Users } from '../models/TodosSchemas';
import { Tokens, UserContacts, Users } from '../models';
import {
  generateAccessToken,
  generateRefreshToken,
  replaceDbRefreshToken,
} from '../utils/authUtils';

const updateToken = async (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken();

  await replaceDbRefreshToken(refreshToken, userId);
  return {
    accessToken,
    refreshToken,
  };
};

const registerController = async (req, res) => {
  const { email, password, userName, age, phone, address } = req.body;
  try {
    const hashPassword = bcrypt.hashSync(password, 7);
    const userContacts = await UserContacts.create({
      age,
      phone,
      address,
    });

    const user = await Users.create({
      email,
      password: hashPassword,
      userName,
      UserContactId: userContacts.id,
    });

    if (user.id) {
      res.status(200).json({
        message: 'User registered',
        status: 200,
      });
    } else {
      res.status(400).json({ error: 'Something wrong!' });
    }
  } catch (e) {
    res.status(403).send({
      status: 403,
      message: e.message,
    });
  }
};

const loginController = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const user = await Users.findOne({ where: { userName } });
    if (!user) {
      res.status(400).send({ message: 'User is absent', status: 400 });
      return;
    }

    if (user.status === USER_STATUS_INACTIVE) {
      res.status(400).json({
        message: 'User is blocked',
        status: 400,
      });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password);

    if (user.userName && !validPassword) {
      res.status(401).json({ message: 'Incorrect password', status: 401 });
      return;
    }
    if (!validPassword) {
      res.status(400).json({ message: 'No such password exists', status: 400 });
      return;
    }

    const tokens = await updateToken(user.id, user.role);
    res.status(200).json({
      tokens,
      data: {
        userName: user.userName,
        id: user.id,
        email: user.email,
        role: user.role,
      },
      status: 200,
    });
  } catch (e) {
    res.status(403).send({
      status: 401,
      message: e.message,
    });
  }
};

const refreshTokensController = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      throw new Error('Empty token');
    }
    const token = await Tokens.findOne({ where: { tokenId: refreshToken } });
    const user = await Users.findOne({ where: { id: token.userId } });
    if (token === null) {
      throw new Error('Invalid token');
    }
    if (user.status === USER_STATUS_INACTIVE) {
      res.status(400).json({
        message: 'User is blocked',
        status: 400,
      });
      return;
    }
    const tokens = await updateToken(token.userId, user.role);

    res.status(200).json({
      tokens,
      data: {
        userName: user.userName,
        id: user.id,
        email: user.email,
        role: user.role,
      },
      status: 200,
    });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(400).json({ message: 'Token expired' });
      return;
    }
    if (e instanceof jwt.JsonWebTokenError) {
      res.status(400).json({ message: 'Invalid Token' });
      return;
    }
    res.status(400).json({ message: e.message });
  }
};

export { registerController, loginController, refreshTokensController };
