function handleInput(msg, send) {
  var context = this.context();

  var duration = this.configDuration || 60;
  var node = this;

  if (msg.payload.increase && node.timer !== null) {
    var seconds = msg.payload.increase;
    node.increaseDuration(seconds);
  }

  if (msg.payload.decrease && node.timer !== null) {
    var seconds = msg.payload.decrease;
    node.decreaseDuration(seconds);
  }

  if (msg.payload.setTo && node.timer !== null) {
    var seconds = msg.payload.setTo;
    node.setDuration(seconds);
  }

  if (msg.payload === "STOP" || msg.payload === "stop") {
    return node.stopTimer();
  }

  if (
    msg.payload === "START" ||
    msg.payload === "start" ||
    msg.action === "START"
  ) {
    return node.startTimer(duration);
  }
}

function setDuration(seconds) {
  var context = this.context();
  return context.set("currentDuration", seconds);
}

function increaseDuration(seconds) {
  var context = this.context();
  var currentDuration = context.get("currentDuration");
  return context.set("currentDuration", currentDuration + seconds);
}

function decreaseDuration(seconds) {
  var context = this.context();
  var currentDuration = context.get("currentDuration");
  const decreasedValue = currentDuration - seconds;

  return decreasedValue < 0
    ? context.set("currentDuration", 0)
    : context.set("currentDuration", decreasedValue);
}

function startUpdateInterval() {
  const node = this;
  const context = node.context();
  console.log("node update interval", node.configUpdateInterval);
  if (node.updateTimer === null) {
    node.updateTimer = setInterval(function() {
      const currentTimer = context.get("currentDuration");
      node.send([null, null, { payload: currentTimer - 1 }]);
    }, node.configUpdateInterval * 1000);
    return true;
  }

  clearInterval(this.updateTimer);
  this.updateTimer = setInterval(() => {
    const currentTimer = context.get("currentDuration");
    node.send([null, null, { payload: currentTimer - 1 }]);
  }, seconds * 1000);
  return true;
}

function stopUpdateInterval() {
  if (this.updateTimer !== null) {
    clearInterval(this.updateTimer);
    this.updateTimer = null;
    return true;
  }

  return false;
}

function startTimer(seconds) {
  var node = this;
  var context = node.context();
  if (node.timer === null) {
    node.setDuration(seconds);
    node.startUpdateInterval();
    node.timer = setInterval(function() {
      const currentTimer = context.get("currentDuration");
      context.set("currentDuration", currentTimer - 1);
      node.status({
        fill: "green",
        shape: "dot",
        text: `Running...\nTime left ${currentTimer - 1} seconds`
      });

      if (currentTimer <= 0) {
        node.stopTimer();
      }
    }, 1000);
  }

  console.log("timer id", context.get("timer"));
  return;
}

function stopTimer() {
  var node = this;
  node.stopUpdateInterval();
  if (this.timer !== null) {
    clearInterval(this.timer);
    node.timer = null;
  }
  node.status({ fill: "red", shape: "dot", text: `STOPPED` });
  node.send([null, { payload: "STOPPED" }, null]);
}

module.exports = function(RED) {
  function flexitimer(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.configDuration = config.duration;
    this.configUpdateInterval = config.updateinterval;
    this.timer = null;
    this.updateTimer = null;
    this.setDuration = setDuration.bind(this);
    this.increaseDuration = increaseDuration.bind(this);
    this.decreaseDuration = decreaseDuration.bind(this);
    this.startUpdateInterval = startUpdateInterval.bind(this);
    this.stopUpdateInterval = stopUpdateInterval.bind(this);
    this.startTimer = startTimer.bind(this);
    this.stopTimer = stopTimer.bind(this);

    var inputHadler = handleInput.bind(this);
    node.on("input", inputHadler);
  }
  RED.nodes.registerType("flexitimer", flexitimer);
};
