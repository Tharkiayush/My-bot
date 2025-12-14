const fs = require("fs");
const path = require("path");

let interval = null;
let messages = [];
let index = 0;

module.exports = {
  name: "target",

  execute(api, event, args) {
    if (!args[0]) {
      return api.sendMessage("❌ Usage: !target <name>", event.threadID);
    }

    if (interval) {
      return api.sendMessage("⚠️ Target already running", event.threadID);
    }

    const file = path.join(__dirname, "..", "messages.txt");
    if (!fs.existsSync(file)) {
      return api.sendMessage("❌ messages.txt not found", event.threadID);
    }

    messages = fs.readFileSync(file, "utf8")
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    if (!messages.length) {
      return api.sendMessage("❌ messages.txt empty", event.threadID);
    }

    const name = args.join(" ");

    api.sendMessage(
      `✅ Target started\n👤 ${name}\n⏱️ 30 sec`,
      event.threadID
    );

    interval = setInterval(() => {
      if (index >= messages.length) index = 0;
      const msg = messages[index].replace(/{name}/g, name);
      api.sendMessage(msg, event.threadID);
      index++;
    }, 30000);
  },

  stop(api, threadID) {
    if (interval) {
      clearInterval(interval);
      interval = null;
      index = 0;
      api.sendMessage("🛑 Target stopped", threadID);
    }
  }
};
