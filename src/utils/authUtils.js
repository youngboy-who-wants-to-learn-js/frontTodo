import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config';
import { Tokens } from '../models';

const { secret, tokens } = config;

export const generateAccessToken = (userId, role) => {
  const payload = {
    userId,
    role,
    type: tokens.access.type,
  };

  const options = {
    expiresIn: tokens.access.expiresIn,
  };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = () => uuidv4();

export const replaceDbRefreshToken = async (refreshTokenId, userId) => {
  await Tokens.destroy({
    where: { userId },
  });
  await Tokens.create({ userId, tokenId: refreshTokenId });
};
