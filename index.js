const login = require("fca-mafiya");
const fs = require("fs");
const path = require("path");

// 🔒 Check required files
if (!fs.existsSync("appstate.json") || !fs.existsSync("admin.json")) {
  console.log("❌ appstate.json / admin.json missing");
  process.exit(1);
}

// 📄 Load admin + prefix from panel config
const config = JSON.parse(fs.readFileSync("admin.json", "utf8"));
const ADMIN = String(config.admin);
const PREFIX = String(config.prefix || "!");

// 📂 Load commands
const commands = new Map();
const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  console.log("❌ commands folder missing");
  process.exit(1);
}

fs.readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"))
  .forEach(file => {
    const cmd = require(`./commands/${file}`);
    if (cmd.name && typeof cmd.execute === "function") {
      commands.set(cmd.name.toLowerCase(), cmd);
    }
  });

console.log("✅ Commands loaded:", [...commands.keys()].join(", "));

// 🔑 Login using appstate.json
login({ appState: require("./appstate.json") }, (err, api) => {
  if (err) {
    console.error("❌ Login failed:", err);
    return;
  }

  console.log(`🤖 Bot logged in | Prefix: ${PREFIX}`);

  api.setOptions({
    listenEvents: true,
    selfListen: false
  });

  api.listenMqtt((err, event) => {
    if (err) return;
    if (!event.body) return;

    // 🔐 Admin-only commands
    if (String(event.senderID) !== ADMIN) return;

    // 🔎 Prefix check
    if (!event.body.startsWith(PREFIX)) return;

    const args = event.body
      .slice(PREFIX.length)
      .trim()
      .split(/\s+/);

    const commandName = args.shift().toLowerCase();
    const command = commands.get(commandName);

    if (!command) return;

    try {
      command.execute(api, event, args);
    } catch (e) {
      console.error("❌ Command error:", e);
      api.sendMessage("❌ Command execution error", event.threadID);
    }
  });
});
