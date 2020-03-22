const convertDuration = (duration, unit) => {
  if (unit === undefined || unit === null || unit === "seconds") {
    return duration;
  }

  if (unit === "minutes") {
    return duration * 60;
  }

  if (unit === "hours") {
    return duration * 60 * 60;
  }
};

export default convertDuration;
