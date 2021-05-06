import jwt from 'jsonwebtoken';
import config from '../../config';

function authMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') {
    next();
  }

  const authHeader = req.get('Authorization');
  if (!authHeader) {
    res.status(401).json({ message: 'Token not provided' });
    return;
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      res.status(403).json({ message: 'User is not logged in' });
    }
    const decodedData = jwt.verify(token, config.secret);
    if (decodedData.type !== 'access') {
      res.status(401).json({ message: 'Invalid token!' });
      return;
    }
    req.user = decodedData;
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(405).json({ status: 405, message: 'Token expired' });
      return;
    }
    if (e instanceof jwt.JsonWebTokenError) {
      res.status(400).json({ message: 'Invalid Token' });
      return;
    }
    res.status(403).json({ message: 'User is not logged in' });
  }
}

export default authMiddleware;
