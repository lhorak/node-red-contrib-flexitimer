import createMessage from "./createMessage";

export default class Timer {
  constructor(node, config) {
    this.node = node;
    this.defaultTime = config.defaultTime || 60;
    this.timeLeft = 0;
    this.updateInterval = config.updateInterval || 1;
    this.instance = null;
    this.isActive = false;
    this.TIMER_INTERVAL = 1000;
  }

  start = () => {
    if (this.isActive) {
      this.timeLeft = this.defaultTime;
      this.sendUpdate("reset");
      return;
    }

    this.isActive = true;
    this.timeLeft = this.defaultTime;
    this.instance = setInterval(() => {
      this.timeLeft -= this.TIMER_INTERVAL / 1000;
      if (this.timeLeft % this.updateInterval === 0) {
        this.sendUpdate();
      }
      this.node.status({
        fill: "green",
        shape: "dot",
        text: `Running... Time left ${this.timeLeft} seconds`
      });

      if (this.timeLeft <= 0) {
        this.stop();
      }
    }, this.TIMER_INTERVAL);

    this.node.send([createMessage("start", this.timeLeft), null, null]);
  };

  stop = () => {
    if (!this.isActive) {
      return;
    }

    clearInterval(this.instance);
    this.instance = null;
    this.isActive = false;

    this.node.status({
      fill: "red",
      shape: "dot",
      text: `stopped at ${Date.now()}`
    });
    this.node.send([null, createMessage("stop", this.timeLeft), null]);
  };

  reset = () => {
    if (this.isActive) {
      this.timeLeft = this.defaultTime;
    } else {
      this.start();
    }
  };

  setTime = seconds => {
    this.timeLeft = seconds;
    this.sendUpdate("set");
  };

  addTime = seconds => {
    this.timeLeft += seconds;
    this.sendUpdate("add");
  };

  subtractTime = seconds => {
    this.timeLeft = Math.max(this.timeLeft - seconds, 0);
    this.sendUpdate("subtract");
  };

  sendUpdate = (action = "update") => {
    if (!this.isActive) {
      return;
    }

    this.node.send([null, null, createMessage(action, this.timeLeft)]);
  };
}
