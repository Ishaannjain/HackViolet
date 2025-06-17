import pickle
import numpy as np

# ✅ Load AI Model and extract the actual classifier if needed
with open("fraud_model.pkl", "rb") as f:
    loaded = pickle.load(f)
    if isinstance(loaded, dict) and "model" in loaded:
        model = loaded["model"]
    else:
        model = loaded

# ✅ Load Scaler
with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# 🚨 Define a Fraud-Like Transaction (Modify if needed)
# Note: This array may not have the proper feature order.
fraud_transaction = np.array([
    -2.7, -1.5, 0.8, -1.9, 3, 500, 0.8, 1.2, -0.9, -4.5, 0.7, 7, 
                    600, -2.1, 0.9, -1.2, 0.8, 0.9, 0.8, 0.9, -3.8, 0.8, -1.0, 0.9, 3, 0.8, 0.9, 0.8, 0.9, 5000
]).reshape(1, -1)

# ✅ Preprocess Data
scaled_transaction = scaler.transform(fraud_transaction)

# ✅ Predict Fraud
fraud_probability = model.predict_proba(scaled_transaction)[0][1]

# ✅ Print Results
print(f"\n🔍 AI Model Confidence: {fraud_probability:.4f}")
if fraud_probability > 0.1:
    print("🚨 Fraud Detected!")
else:
    print("✅ Transaction is Safe.")
