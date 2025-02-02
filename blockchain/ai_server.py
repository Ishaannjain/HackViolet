from flask import Flask, request, jsonify
import pickle
import numpy as np

with open("Trained AI model files/fraud_model.pkl", "rb") as f:
    loaded = pickle.load(f)
    if isinstance(loaded, dict) and "model" in loaded:
        model = loaded["model"]
    else:
        model = loaded

with open("Trained AI model files/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

app = Flask(__name__)

THRESHOLD = 0.3  # If fraud probability >= threshold, transaction is fraudulent

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json["transactionData"]
        scaled_data = scaler.transform([data])  # Scale data
        fraud_probability = model.predict_proba(scaled_data)[0][1]  # Get fraud confidence

        is_fraud = bool(fraud_probability >= THRESHOLD)

        return jsonify({
            "fraudulent": is_fraud,
            "fraud_probability": float(fraud_probability)
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
