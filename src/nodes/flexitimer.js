import Timer from "../lib/Timer";
import convertDuration from "../lib/convertDuration";

module.exports = function(RED) {
  function flexitimer(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const defaultDuration = config.duration || 60;
    const defaultDurationUnit = config.durationunit || "seconds";
    const updateInterval = config.updateinterval || 1;
    const updateIntervalUnit = config.updateunit || "seconds";

    const timerInstance = new Timer(node, {
      defaultTime: convertDuration(defaultDuration, defaultDurationUnit),
      updateInterval: convertDuration(updateInterval, updateIntervalUnit)
    });

    const handleInput = msg => {
      if (msg.payload.increase) {
        var seconds = msg.payload.increase;
        return timerInstance.addTime(seconds);
      }

      if (msg.payload.decrease) {
        var seconds = msg.payload.decrease;
        return timerInstance.subtractTime(seconds);
      }

      if (msg.payload.setTo) {
        var seconds = msg.payload.setTo;
        return timerInstance.setTime(seconds);
      }

      if (msg.payload === "STOP" || msg.payload === "stop") {
        return timerInstance.stop();
      }

      if (
        msg.payload === "START" ||
        msg.payload === "start" ||
        msg.action === "START"
      ) {
        return timerInstance.start();
      }
    };

    node.on("input", handleInput);
  }
  RED.nodes.registerType("flexitimer", flexitimer);
};
