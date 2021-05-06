import express from 'express';
import {
  assignRoleController,
  getAllUsersController,
  setUserStatusController,
} from '../controllers/userControllers';

const router = express.Router();

router.patch('/assign-role/:role/:id', assignRoleController);
router.patch('/set-status/:status/:id', setUserStatusController);
router.get('/', getAllUsersController);

export default router;
