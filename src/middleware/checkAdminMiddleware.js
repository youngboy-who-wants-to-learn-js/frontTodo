import { USER_ROLE_ADMIN } from '../enums/role';

function checkAdminMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    if (req.user.role !== USER_ROLE_ADMIN) {
      res.status(400).json({
        status: 400,
        message: 'You have no rights',
      });
      return;
    }
    next();
  } catch (e) {
    res.status(400).json({ message: e.message, status: 400 });
  }
}

export default checkAdminMiddleware;
