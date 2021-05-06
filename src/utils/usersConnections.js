class UsersConnection {
  constructor() {
    this.users = {};
  }

  addUserConnection(userId, socketId) {
    if (this.users[userId] && !this.users[userId].includes(socketId)) {
      this.users[userId] = [...this.users[userId], socketId];
    } else {
      this.users[userId] = [socketId];
    }
  }

  removeSocketConnectionFromUser(userId, socketId) {
    this.users[userId] = this.users[userId].filter((item) => item !== socketId);
    if (!this.users[userId].length) {
      delete this.users[userId];
    }
  }

  findAndRemoveConnection(socketId) {
    Object.entries(this.users).forEach((item) => {
      if (item[1].includes(socketId)) {
        return this.removeSocketConnectionFromUser(item[0], socketId);
      }
    });
  }

  get onlineUsers() {
    return Object.keys(this.users);
  }
}

const userConnections = new UsersConnection();
export default userConnections;
