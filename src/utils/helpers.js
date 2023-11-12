const checkPropInObj = (eventsObj, type) =>
  Object.values(eventsObj).includes(type);

export default checkPropInObj;
