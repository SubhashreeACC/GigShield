"""
Phase 10 Task 58: Train MVP risk scoring model.
Uses RandomForest with synthetic data.
Run: python services/ml/train_model.py
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
import os

def train():
    # Load training data
    data_path = os.path.join(os.path.dirname(__file__), "data", "training_data.csv")
    df = pd.read_csv(data_path)

    print(f"📊 Training data: {len(df)} rows")
    print(f"📊 Columns: {list(df.columns)}")

    # Encode categorical features
    le_city = LabelEncoder()
    le_zone = LabelEncoder()
    le_season = LabelEncoder()

    df["city_encoded"] = le_city.fit_transform(df["city"])
    df["zone_encoded"] = le_zone.fit_transform(df["zone"])
    df["season_encoded"] = le_season.fit_transform(df["season"])

    # Features and target
    features = ["city_encoded", "zone_encoded", "season_encoded",
                "avg_rainfall_mm", "avg_temp_c", "avg_aqi",
                "historical_claims", "disruption_freq"]
    target = "risk_score"

    X = df[features].values
    y = df[target].values

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        min_samples_leaf=2,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"✅ Model trained!")
    print(f"   MAE: {mae:.4f}")
    print(f"   R²:  {r2:.4f}")

    # Feature importance
    importances = dict(zip(features, model.feature_importances_))
    print(f"   Feature importances: {importances}")

    # Save model and encoders
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)

    with open(os.path.join(model_dir, "risk_model.pkl"), "wb") as f:
        pickle.dump(model, f)

    with open(os.path.join(model_dir, "encoders.pkl"), "wb") as f:
        pickle.dump({
            "city": le_city,
            "zone": le_zone,
            "season": le_season,
            "features": features,
        }, f)

    print(f"💾 Model saved to {model_dir}/risk_model.pkl")
    print(f"💾 Encoders saved to {model_dir}/encoders.pkl")

if __name__ == "__main__":
    train()
