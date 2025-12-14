const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <h2>Bot Control Panel</h2>

    <form method="post" action="/save" enctype="multipart/form-data">
      <p>Admin UID:</p>
      <input name="admin" required /><br><br>

      <p>Command Prefix:</p>
      <input name="prefix" value="!" required /><br><br>

      <p>Upload appstate.json:</p>
      <input type="file" name="appstate" required /><br><br>

      <button>Save</button>
    </form>

    <p><b>Note:</b> Bot idle rahega jab tak command na mile.</p>
  `);
});

app.post("/save", upload.single("appstate"), (req, res) => {
  const data = {
    admin: req.body.admin,
    prefix: req.body.prefix
  };

  fs.writeFileSync("admin.json", JSON.stringify(data, null, 2));
  fs.renameSync(req.file.path, "appstate.json");

  res.send("✅ Admin UID, Prefix & Appstate saved successfully.");
});

app.listen(3000, () => {
  console.log("🟢 Panel running on http://localhost:3000");
});
