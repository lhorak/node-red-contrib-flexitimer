const createMessage = (action, timeLeft, other = {}) => ({
  payload: {
    action,
    timeLeft,
    timestamp: new Date().toISOString(),
    ...other
  }
});

export default createMessage;
