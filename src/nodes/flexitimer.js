import { propOr, toLower } from "ramda";

import Timer from "../lib/Timer";
import convertDuration from "../lib/convertDuration";

const incrementRegex = /^inc(re(ase|ment))?$/gim;
const decrementRegex = /^dec(re(ase|ment))?$/gim;
const startRegex = /^(start|on|begin)$/gim;
const stopRegex = /^(stop|off|end)$/gim;
const restartRegex = /^re(start|set)$/gim;

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
      const { payload } = msg;

      if (has("action")(payload)) {
        const { action } = payload;

        if (startRegex.test(action)) {
          return timerInstance.start();
        }

        if (stopRegex.test(action)) {
          return timerInstance.stop();
        }

        if (incrementRegex.test(action)) {
          const { value, unit } = payload;
          const duration = convertDuration(value, propOr("seconds", unit));
          return timerInstance.addTime(duration);
        }

        if (decrementRegex.test(action)) {
          const { value, unit } = payload;
          const duration = convertDuration(value, propOr("seconds", unit));
          return timerInstance.subtractTime(duration);
        }
      }

      if (has("increase")(payload)) {
        const duration = convertDuration(
          payload.increase,
          propOr("seconds", payload.unit)
        );
        return timerInstance.addTime(duration);
      }

      if (has("decrease")(payload)) {
        const duration = convertDuration(
          payload.decrease,
          propOr("seconds", payload.unit)
        );
        return timerInstance.subtractTime(duration);
      }

      if (has("setTo")(payload)) {
        const duration = convertDuration(
          payload.setTo,
          propOr("seconds", payload.unit)
        );
        return timerInstance.setTime(duration);
      }

      if (toLower(payload) === "stop") {
        return timerInstance.stop();
      }

      if (toLower(payload) === "start") {
        return timerInstance.start();
      }
    };

    node.on("input", handleInput);
  }
  RED.nodes.registerType("flexitimer", flexitimer);
};
