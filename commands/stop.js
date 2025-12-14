const target = require("./target");

module.exports = {
  name: "stop",
  execute(api, event) {
    target.stop(api, event.threadID);
  }
};
