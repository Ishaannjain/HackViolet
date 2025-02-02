const express = require("express");
const { spawn } = require("child_process");
const app = express();
// 1) Import cors
const cors = require("cors");
app.use(cors());
app.use(express.json());

// We'll keep a reference to our spawned Python script
let runAllProcess = null;


// 1) Endpoint to start run_all.py without blocking
app.post("/start_script", (req, res) => {
  if (runAllProcess) {
    return res.status(400).json({ error: "Script is already running." });
  }

  // Spawn the Python script in the background
  runAllProcess = spawn("python", ["run_all.py"], {
    stdio: ["pipe", "pipe", "pipe"] // give us access to stdin, stdout, stderr
  });

//  // Log any output the script prints
  runAllProcess.stdout.on("data", (data) => {
    console.log("[run_all.py stdout]:", data.toString());
  });

  // Log any errors
  runAllProcess.stderr.on("data", (data) => {
    console.error("[run_all.py stderr]:", data.toString());
  });

  // When the script exits, reset our reference
  runAllProcess.on("close", (code) => {
    console.log(`run_all.py exited with code ${code}`);
    runAllProcess = null;
  });

  return res.json({ message: "run_all.py started (waiting for 'balls')" });
});

// 2) Endpoint to send "balls" to run_all.py via stdin
app.post("/send_balls", (req, res) => {
  if (!runAllProcess) {
    return res.status(400).json({ error: "No run_all.py process is running." });
  }
  // Write "balls\n" to the script's stdin
  runAllProcess.stdin.write("balls\n");
  return res.json({ message: "Starting Transaction..." });
});

// 3) (Optional) Endpoint to stop the script if needed
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
