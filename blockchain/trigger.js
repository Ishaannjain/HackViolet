const express = require("express");
const { spawn } = require("child_process");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

let runAllProcess = null;


app.post("/start_script", (req, res) => {
  if (runAllProcess) {
    return res.status(400).json({ error: "Script is already running." });
  }

  runAllProcess = spawn("python", ["run_all.py"], {
    stdio: ["pipe", "pipe", "pipe"] // give us access to stdin, stdout, stderr
  });

  runAllProcess.stdout.on("data", (data) => {
    console.log("[run_all.py stdout]:", data.toString());
  });

  runAllProcess.stderr.on("data", (data) => {
    console.error("[run_all.py stderr]:", data.toString());
  });

  runAllProcess.on("close", (code) => {
    console.log(`run_all.py exited with code ${code}`);
    runAllProcess = null;
  });

  return res.json({ message: "run_all.py started (waiting for 'balls')" });
});

app.post("/send_balls", (req, res) => {
  if (!runAllProcess) {
    return res.status(400).json({ error: "No run_all.py process is running." });
  }
  runAllProcess.stdin.write("balls\n");
  return res.json({ message: "Starting Transaction..." });
});

app.post("/stop_script", (req, res) => {
  if (!runAllProcess) {
    return res.status(400).json({ error: "No running script to stop." });
  }
  runAllProcess.kill("SIGINT"); // send Ctrl+C
  runAllProcess = null;
  return res.json({ message: "Stopped run_all.py" });
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Trigger server running on port ${PORT}`);
});
