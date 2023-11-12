import {
  SOCKET_TODOS_EVENTS,
  SOCKET_USERS_EVENTS,
} from '../enums/socketEvents';
import checkPropInObj from '../utils/helpers';
import todosSocketEventHandler from './todosSocketEventHandler';
import usersSocketEventsHandler from './usersSocketEventsHandler';

async function handleSocketEvents(socket, socketPayload) {
  if (checkPropInObj(SOCKET_TODOS_EVENTS, socketPayload.type)) {
    return todosSocketEventHandler(socket, socketPayload);
  }
  if (checkPropInObj(SOCKET_USERS_EVENTS, socketPayload.type)) {
    return usersSocketEventsHandler(socket, socketPayload);
  }
}
export default handleSocketEvents;
