import subprocess
import time
import threading
import requests
import json
import sys
import select

# List of predefined web requests (random transactions)
transactions = [
    {
        "sender": "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
        "receiver": "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
        "amount": "500",
        "transactionData": [-3.043, 1, 1, 1, 5, 900, 1, 1, 1, -5.0, 1, 9, 800, 1, 1, 1, 1, 1, 1, 1, -4.9, 1, 1, 1, 4, 1, 1, 1, 1, 1]
    },
    {
        "sender": "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
        "receiver": "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
        "amount": "99999",
        "transactionData": [-2.7, -1.5, 0.8, -1.9, 3, 500, 0.8, 1.2, -0.9, -4.5, 0.7, 7, 600, -2.1, 0.9, -1.2, 0.8, 0.9, 0.8, 0.9, -3.8, 0.8, -1.0, 0.9, 3, 0.8, 0.9, 0.8, 0.9, 5000]
    },
]

def flush_stdin():
    """Flush any stray input (for Windows) so that input() waits for actual user input."""
    try:
        import msvcrt
        while msvcrt.kbhit():
            msvcrt.getch()
    except ImportError:
        # On Unix-like systems, use select
        while sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
            sys.stdin.readline()

def start_servers():
    print("🚀 Starting Hardhat node...", flush=True)
    # Start the Hardhat node
    hardhat_proc = subprocess.Popen("npx hardhat node", shell=True)
    time.sleep(5)  # Give Hardhat node time to initialize

    print("🧹 Cleaning artifacts...", flush=True)
    subprocess.run("npx hardhat clean", shell=True)
    time.sleep(2)

    print("🔨 Compiling contracts...", flush=True)
    compile_proc = subprocess.run("npx hardhat compile", shell=True, capture_output=True, text=True)
    print(compile_proc.stdout, flush=True)
    print(compile_proc.stderr, flush=True)
    if compile_proc.returncode != 0:
        print("❌ Hardhat compile failed!", flush=True)
        return

    print("🚀 Deploying contract...", flush=True)
    deploy_process = subprocess.run("npx hardhat run scripts/deploy.js --network localhost",
                                    shell=True, capture_output=True, text=True)
    print(deploy_process.stdout, flush=True)
    print(deploy_process.stderr, flush=True)
    if deploy_process.returncode != 0:
        print("❌ Deploy script failed!", flush=True)
        return

    # Wait until contract-address.json is generated
    contract_address = None
    for _ in range(20):
        try:
            with open("contract-address.json", "r") as file:
                contract_address = json.load(file)["contractAddress"]
                print(f"✅ Contract Address: {contract_address}", flush=True)
                break
        except (FileNotFoundError, json.JSONDecodeError):
            print("⏳ Waiting for contract-address.json...", flush=True)
            time.sleep(1)

    if not contract_address:
        print("🚨 Error: contract-address.json not found. Did the contract deploy?", flush=True)
        sys.exit(1)

    print("🚀 Starting AI server...", flush=True)
    subprocess.Popen("python ai_server.py", shell=True)
    time.sleep(2)

    print("🚀 Starting backend server...", flush=True)
    subprocess.Popen("node server.js", shell=True)
    time.sleep(5)

    print("✅ All servers are running!", flush=True)

# Function to send transactions
index = 0
def send_transaction():
    global index
    if index >= len(transactions):
        print("🚀 All transactions sent! Restarting from the first one...", flush=True)
        index = 0

    url = "http://localhost:3000/storeTransaction"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(transactions[index])
    
    print(f"📩 Sending transaction {index+1}...", flush=True)
    try:
        response = requests.post(url, headers=headers, data=data)
        print(f"🔍 Response: {response.json()}\n", flush=True)
    except Exception as e:
        print(f"🚨 Error sending transaction: {e}", flush=True)
    index += 1

# Start servers in a background thread
#threading.Thread(target=start_servers, daemon=True).start()
start_servers()
# Wait a bit to ensure servers are fully running
time.sleep(5)
flush_stdin()

print("🖱️ Ready to send transactions.", flush=True)
print("run_all.py started, waiting for 'balls'...", flush=True)

while True:
    user_input = input().strip().lower()  # Wait for input from stdin
    if user_input == "balls":
        print("Got 'balls'! Sending transactions...", flush=True)
        # Put your transaction sending logic here, e.g. send_transaction()
        send_transaction()
    else:
        print(f"Ignored input: {user_input}", flush=True)
