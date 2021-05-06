import ee from '../utils/eventEmitter';

function socketEventMiddleware(req, res, next) {
  try {
    const headerSocketId = req.headers.socketid;
    const { userId } = req.user;

    res.sendSocketEvent = (socketPayload) => {
      const updatedSockedPayload = { ...socketPayload };
      const helper = {
        headerSocketId,
        userId,
      };
      updatedSockedPayload.helper = helper;
      if (!process.env.JEST_WORKER_ID) {
        ee.emit('notice', updatedSockedPayload);
      }
    };
    next();
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
}
export default socketEventMiddleware;
