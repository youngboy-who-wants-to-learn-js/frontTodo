import moment from 'moment';
import sequelize from 'sequelize';
import { SOCKET_TODOS_EVENTS } from '../enums/socketEvents';
import { Todos } from '../models';

const getAllTodos = async (req, res) => {
  const { userId } = req.user;
  const { filter } = req.query;
  try {
    let filterName;

    if (filter === 'active') {
      filterName = { where: { UserId: userId, completed: false } };
    } else if (filter === 'completed') {
      filterName = { where: { UserId: userId, completed: true } };
    } else {
      filterName = { where: { UserId: userId } };
    }

    if (req.query.period) {
      const days = req.query.period;
      filterName.where.createdAt = {
        [sequelize.Op.gte]: moment()
          .startOf('day')
          .subtract(days, 'days')
          .toDate(),
      };
    }

    if (req.query.dateRangeFrom && req.query.dateRangeTo) {
      filterName.where.createdAt = {
        [sequelize.Op.gte]: req.query.dateRangeFrom,
        [sequelize.Op.lte]: req.query.dateRangeTo,
      };
    }
    const result = await Todos.findAll(filterName);
    res.sendSocketEvent({
      type: SOCKET_TODOS_EVENTS.get,
      payload: result,
    });
    res.status(200).json({
      status: 200,
      data: result,
    });
  } catch (e) {
    res.status(401).send({
      status: 401,
      message: e.message,
    });
  }
};

const addNewTodo = async (req, res) => {
  const { text } = req.body;
  const { userId } = req.user;

  try {
    const result = await Todos.create({ text, UserId: userId });

    res.sendSocketEvent({
      type: SOCKET_TODOS_EVENTS.add,
      payload: result,
    });
    res.status(200).send(result);
  } catch (e) {
    res.status(401).send({
      status: 401,
      message: e.message,
    });
  }
};

const deleteTodo = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const result = await Todos.destroy(
      {
        where: { UserId: userId, id },
      },
      { returning: true }
    );
    if (result) {
      res.sendSocketEvent({
        type: SOCKET_TODOS_EVENTS.delete,
        payload: { id },
      });
      res.status(200).send({
        statusCode: 200,
        data: { id },
      });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log('deleteTodo', e);
    res.status(401).send({
      status: 401,
      message: e.message,
    });
  }
};

const updateTodo = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const todo = await Todos.update(
      req.body,
      {
        where: { id, UserId: userId },
      },
      { returning: true }
    );
    if (todo[0] === 0) {
      res.status(400).json({ status: 200, message: 'Todo not found' });
      return;
    }
    const updatedTodo = await Todos.findOne({ where: { id, UserId: userId } });
    res.sendSocketEvent({
      type: SOCKET_TODOS_EVENTS.update,
      payload: updatedTodo,
    });
    res.status(200).send(updatedTodo);
  } catch (e) {
    res.status(401).send({
      status: 401,
      message: e.message,
    });
  }
};

const deleteCompletedTodos = async (req, res) => {
  const { userId } = req.user;
  const ids = req.body;
  try {
    if (!ids.length) {
      res.status(401).json({ status: 401, message: 'No tasks to delete' });
      return;
    }
    const result = await Todos.destroy(
      { where: { id: ids, UserId: userId } },
      { returning: true }
    );
    console.log('&&&&&&', result);
    if (result) {
      res.sendSocketEvent({
        type: SOCKET_TODOS_EVENTS.deleteCompltd,
        payload: ids,
      });
      res.status(200).json({
        status: 200,
        data: ids,
      });
    } else {
      res.status(400).json({ status: 400, message: 'There are no such todos' });
    }
  } catch (e) {
    res.status(401).send({
      status: 401,
      message: e.message,
    });
  }
};

const toggleAllTodos = async (req, res) => {
  const { userId } = req.user;
  try {
    const { ids, value } = req.body;
    const result = await Todos.update(
      { completed: value },
      { where: { id: ids, UserId: userId } }
    );
    if (result) {
      res.sendSocketEvent({
        type: SOCKET_TODOS_EVENTS.toggleall,
        payload: req.body,
      });
      res.status(200).send(req.body);
    } else {
      res.sendStatus(501);
    }
  } catch (e) {
    res.status(401).send({
      status: 401,
      message: e.message,
    });
  }
};

export {
  getAllTodos,
  addNewTodo,
  deleteTodo,
  updateTodo,
  deleteCompletedTodos,
  toggleAllTodos,
};
