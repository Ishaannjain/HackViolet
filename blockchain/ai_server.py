from flask import Flask, request, jsonify
import pickle
import numpy as np

# ✅ Load AI Model
with open("Trained AI model files/fraud_model.pkl", "rb") as f:
    loaded = pickle.load(f)
    if isinstance(loaded, dict) and "model" in loaded:
        model = loaded["model"]
    else:
        model = loaded

# ✅ Load Scaler
with open("Trained AI model files/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# ✅ Initialize Flask App
app = Flask(__name__)

# ✅ Set a fraud threshold (adjust this as needed)
THRESHOLD = 0.3  # If fraud probability >= threshold, transaction is fraudulent

# 📌 Fraud Prediction Endpoint
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # ✅ Get transaction data from request
        data = request.json["transactionData"]
        scaled_data = scaler.transform([data])  # Scale data
        fraud_probability = model.predict_proba(scaled_data)[0][1]  # Get fraud confidence

        # ✅ Determine if it's fraud based on threshold; convert to native Python bool
        is_fraud = bool(fraud_probability >= THRESHOLD)

        return jsonify({
            "fraudulent": is_fraud,
            "fraud_probability": float(fraud_probability)
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# ✅ Run Flask Server
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
