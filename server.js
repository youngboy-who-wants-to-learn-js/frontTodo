import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import logger from 'morgan';
import socketIo from 'socket.io';
import authMiddleware from './src/middleware/authMiddleware';
import checkAdminMiddleware from './src/middleware/checkAdminMiddleware';
import socketEventMiddleware from './src/middleware/socketEventMiddleware';
import authRouter from './src/routes/authRouter';
import indexRouter from './src/routes/index';
import todosRouter from './src/routes/todosRouter';
import userRouter from './src/routes/userRouter';
import handleSocketEvents from './src/socket/handleSocketEvents';
import ee from './src/utils/eventEmitter';
import userConnections from './src/utils/usersConnections';

export const boot = () => {
  const app = express();

  app.use(cors());
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/', indexRouter);
  app.options('/*', cors());
  app.use('/todos', authMiddleware, socketEventMiddleware, todosRouter);
  app.use('/auth', authRouter);
  app.use(
    '/users',
    authMiddleware,
    checkAdminMiddleware,
    socketEventMiddleware,
    userRouter
  );

  dotenv.config();

  return app;
};

export const startup = () => {
  const app = boot();
  const server = http.Server(app);

  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
      credentials: true,
    },
  });

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  io.on('connection', (socket) => {
    socket.on('connect-id', (data) => {
      console.log('test connect-id:', data);
      if (data.userId && data.socketId) {
        userConnections.addUserConnection(data.userId, data.socketId);
      }
      console.log('users connection', userConnections.users);
    });
    socket.on('disconnect', () => {
      console.log('disconnect', socket.id);
      userConnections.findAndRemoveConnection(socket.id);
      console.log('users connection', userConnections.users);
    });

    socket.on('login', (data) => {
      if (data.userId && data.socketId) {
        userConnections.addUserConnection(data.userId, data.socketId);
      }
      console.log('users connection', userConnections.users);
    });

    socket.on('logout', () => {
      userConnections.findAndRemoveConnection(socket.id);
      console.log('users connection', userConnections.users);
    });
  });

  ee.on('notice', (socketPayload) => {
    handleSocketEvents(io, socketPayload);
  });

  server.listen(process.env.PORT || 3001, () => {
    console.log('Server has been started ....');
  });
};

export default startup;
