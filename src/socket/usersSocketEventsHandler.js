import { USER_ROLE_ADMIN } from '../enums/role';
import { Users } from '../models';
import usersConnections from '../utils/usersConnections';

const usersSocketEventsHandler = async (socket, socketPayload) => {
  const { userId, headerSocketId } = socketPayload.helper;
  const { id: userForUpdate } = socketPayload.payload;
  if (usersConnections.users[userId]) {
    const admins = await Users.findAll({
      where: { role: USER_ROLE_ADMIN },
    });
    const adminsIds = admins.map((admin) => admin.id);

    const payload = { ...socketPayload };
    delete payload.helper;

    usersConnections.onlineUsers.forEach((user) => {
      if (adminsIds.includes(+user)) {
        usersConnections.users[user].forEach((id) => {
          if (id !== headerSocketId) {
            socket.to(id).emit('event', payload);
          }
        });
      } else if (+user === userForUpdate) {
        usersConnections.users[user].forEach((id) => {
          socket.to(id).emit('event', payload);
        });
      }
    });
  }
};

export default usersSocketEventsHandler;
