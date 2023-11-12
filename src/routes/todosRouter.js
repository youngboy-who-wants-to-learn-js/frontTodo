import express from 'express';
import {
  getAllTodos,
  addNewTodo,
  deleteTodo,
  updateTodo,
  deleteCompletedTodos,
  toggleAllTodos,
} from '../controllers/todosControllers';

const router = express.Router();

router.patch('/toggleall', toggleAllTodos);
router.delete('/deletecompleted', deleteCompletedTodos);
router.get('/', getAllTodos);
router.post('/', addNewTodo);
router.delete('/:id', deleteTodo);
router.patch('/:id', updateTodo);

export default router;
