This project is a trained AI model designed to detect fraudulent credit card transactions using a dataset sourced from Kaggle and trained with an XGBoost (Extreme Gradient Boosting) algorithm.

Dataset-

Source: Kaggle (Credit Card Fraud Detection Dataset)

Description:

The dataset contains anonymized transaction data, including 30 numerical features (V1-V28, Time, and Amount) and a target variable Class.

Class: 0 indicates a legitimate transaction, and 1 indicates fraud.

Imbalanced dataset: ~99.8% legitimate transactions and ~0.2% fraudulent transactions.

Model

Algorithm: XGBoost (Extreme Gradient Boosting)

Reason for Selection:

Handles imbalanced datasets effectively.

Offers high performance with gradient boosting on decision trees.

Provides interpretability through feature importance.

Features:

Time and Amount features were scaled using StandardScaler.

Synthetic minority over-sampling technique (SMOTE) was applied to balance the dataset.

How we choose data model-

XGBoost
Accuracy: 99.95%
Precision: 98-99%
Recall: 97-98%
Best overall performance

Random Forest-
Accuracy: 99.93%
Precision: 97-98%
Recall: 95-96%
Good balance of performance and interpretability

LightGBM-
Accuracy: 99.94%
Precision: 97-98%
Recall: 96-97%
Fastest training time

Isolation Forest-
Accuracy: ~99.5%
Precision: ~85%
Recall: ~75%'
Would've been better for unsupervised data

Final Confusion Matrix for XgBoost:
[[48116  8748]
 [    6    92]]
