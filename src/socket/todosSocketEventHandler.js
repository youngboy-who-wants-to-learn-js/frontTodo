import usersConnections from '../utils/usersConnections';

const todosSocketEventHandler = (socket, socketPayload) => {
  const { userId, headerSocketId } = socketPayload.helper;
  if (usersConnections.users[userId]) {
    const payload = { ...socketPayload };
    delete payload.helper;
    usersConnections.users[userId].forEach((id) => {
      if (id !== headerSocketId) {
        socket.to(id).emit('event', payload);
      }
    });
  }
};

export default todosSocketEventHandler;
