import express from 'express';
import {
  loginController,
  refreshTokensController,
  registerController,
} from '../controllers/authController';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh-tokens', refreshTokensController);

export default router;
