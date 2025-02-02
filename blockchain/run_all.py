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
        "transactionData": [-2.7, -1.5, 0.8, -1.9, 3, 500, 0.8, 1.2, -0.9, -4.5, 0.7, 7, 600, -2.1, 0.9, -1.2, 0.8, 0.9, 0.8, 0.9, -3.8, 0.8, -1.0, 0.9, 3, 0.8, 0.9, 0.8, 0.9, 5000]
    },
    {
        "sender": "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
        "receiver": "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
        "amount": "9999",
        "transactionData": [-3.043, 1, 1, 1, 5, 900, 1, 1, 1, -5.0, 1, 9, 800, 1, 1, 1, 1, 1, 1, 1, -4.9, 1, 1, 1, 4, 1, 1, 1, 1, 1]
    }
]

def flush_stdin():
    """Flush any stray input (for Windows) so that input() waits for actual user input."""
    try:
        import msvcrt
        while msvcrt.kbhit():
            msvcrt.getch()
    except ImportError:
        # On Unix-like systems, use select
        import sys, select
        while sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
            sys.stdin.readline()

def start_servers():
    print("🚀 Starting Hardhat node...")
    # Start the Hardhat node
    hardhat_proc = subprocess.Popen("npx hardhat node", shell=True)
    time.sleep(10)  # Wait longer to ensure the node is fully up

    # Run hardhat clean
    print("🧹 Cleaning artifacts...")
    subprocess.run("npx hardhat clean", shell=True)
    time.sleep(2)

    # Run hardhat compile
    print("🔨 Compiling contracts...")
    compile_proc = subprocess.run("npx hardhat compile", shell=True, capture_output=True, text=True)
    print(compile_proc.stdout)
    time.sleep(2)

    print("🚀 Deploying contract...")
    deploy_process = subprocess.run("npx hardhat run scripts/deploy.js --network localhost", shell=True, capture_output=True, text=True)
    print(deploy_process.stdout)

    # Wait until contract-address.json is generated
    contract_address = None
    for _ in range(20):
        try:
            with open("contract-address.json", "r") as file:
                contract_address = json.load(file)["contractAddress"]
                print(f"✅ Contract Address: {contract_address}")
                break
        except (FileNotFoundError, json.JSONDecodeError):
            print("⏳ Waiting for contract address...")
            time.sleep(1)

    if not contract_address:
        print("🚨 Error: contract-address.json not found. Did the contract deploy?")
        sys.exit(1)

    # Start AI and backend servers
    print("🚀 Starting AI server...")
    subprocess.Popen("python ai_server.py", shell=True)
    time.sleep(3)
    print("🚀 Starting backend server...")
    subprocess.Popen("node server.js", shell=True)
    time.sleep(5)
    print("✅ All servers are running!")

# Function to send transactions
index = 0
def send_transaction():
    global index
    if index >= len(transactions):
        print("🚀 All transactions sent! Restarting from the first one...")
        index = 0

    url = "http://localhost:3000/storeTransaction"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(transactions[index])
    
    print(f"📩 Sending transaction {index+1}...")
    try:
        response = requests.post(url, headers=headers, data=data)
        print(f"🔍 Response: {response.json()}\n")
    except Exception as e:
        print(f"🚨 Error sending transaction: {e}")
    index += 1

# Start servers in a separate thread
threading.Thread(target=start_servers, daemon=True).start()

# Wait a bit to ensure servers are fully running and flush any stray input
time.sleep(15)
flush_stdin()
print("🖱️ Ready to send transactions.")

# Main loop: wait for user input before sending each transaction.
while True:
    user_input = input("Type 'balls' to send the next transaction: ").strip().lower()
    if user_input == "balls":
        send_transaction()
    else:
        print("❌ Invalid input. Please type 'balls'.")
