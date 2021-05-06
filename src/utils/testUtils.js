import jwt from 'jsonwebtoken';
import config from '../../config';

const { secret, tokens } = config;

const generateAccessToken = (userId, role) => {
  const payload = {
    userId,
    role,
    type: tokens.access.type,
  };
  return jwt.sign(payload, secret);
};

export default generateAccessToken;
