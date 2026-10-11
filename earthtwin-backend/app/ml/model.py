"""
EarthTwin — Machine Learning Training Pipeline Blueprint
Location: app/ml/model.py

This module defines the training architecture for future Machine Learning models:
- Feature vector schema definitions
- Scikit-learn Pipeline construction template
- Synthetic training dataset generator for demonstration & training experiments
"""

from typing import List, Dict, Any
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    np = None
    NUMPY_AVAILABLE = False

# Feature vector specification used by EarthTwin ML models
FEATURE_COLUMNS: List[str] = [
    "temperature",        # °C (-10 to 50)
    "humidity",           # % (0 to 100)
    "rainfall",           # mm (0 to 300)
    "soil_moisture",      # % (0 to 100)
    "vegetation_health",  # 0 to 100
    "air_quality",        # 0 to 100
]

TARGET_COLUMNS: List[str] = [
    "fire_risk",          # % (0 to 100)
    "drought_risk",       # % (0 to 100)
    "vegetation_stress",  # % (0 to 100)
    "overall_health",     # 0 to 100
]


def create_training_pipeline():
    """
    Constructs a scikit-learn MultiOutputRegressor pipeline.
    
    Example usage for future student research:
        from app.ml.model import create_training_pipeline
        pipeline = create_training_pipeline()
        pipeline.fit(X_train, y_train)
        joblib.dump(pipeline, './app/ml/models/ecosystem_model.pkl')
    """
    try:
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.preprocessing import StandardScaler
        from sklearn.pipeline import Pipeline
        from sklearn.multioutput import MultiOutputRegressor

        regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=4,
            random_state=42
        )
        
        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("model", MultiOutputRegressor(regressor))
        ])
        return pipeline
    except ImportError:
        return None


def generate_synthetic_training_data(n_samples: int = 500):
    """
    Generates realistic ecological synthetic data for exploratory student experiments.
    """
    np.random.seed(42)
    
    # Simulate feature matrix
    temps = np.random.uniform(15.0, 42.0, n_samples)
    humidity = np.random.uniform(20.0, 90.0, n_samples)
    rainfall = np.random.exponential(scale=15.0, size=n_samples)
    soil_moisture = np.clip(humidity * 0.4 + rainfall * 0.8 + np.random.normal(0, 5, n_samples), 5, 95)
    veg_health = np.clip(soil_moisture * 0.7 - (temps - 25)**2 * 0.05 + np.random.normal(0, 4, n_samples), 10, 95)
    air_quality = np.random.uniform(40.0, 95.0, n_samples)
    
    X = np.column_stack([temps, humidity, rainfall, soil_moisture, veg_health, air_quality])
    
    # Synthetic target relationships
    fire_risk = np.clip((temps - 20) * 2.5 + (60 - humidity) * 0.8 + (50 - soil_moisture) * 0.9 - rainfall * 0.5, 5, 95)
    drought_risk = np.clip((60 - soil_moisture) * 1.1 + (20 - rainfall) * 1.2 + (temps - 25) * 0.8, 5, 95)
    veg_stress = np.clip(100 - veg_health + (temps - 30) * 1.2, 5, 95)
    overall_health = np.clip((veg_health * 0.35 + soil_moisture * 0.30 + air_quality * 0.15 + (100 - fire_risk) * 0.20), 10, 98)
    
    y = np.column_stack([fire_risk, drought_risk, veg_stress, overall_health])
    
    return X, y


if __name__ == "__main__":
    print("🌲 EarthTwin ML Module Blueprint")
    print("Features expected:", FEATURE_COLUMNS)
    print("Targets expected:", TARGET_COLUMNS)
    X, y = generate_synthetic_training_data(10)
    print("Sample feature vector row 0:", X[0])
    print("Sample target vector row 0:", y[0])
    print("✅ ML pipeline blueprint ready for scikit-learn model training.")
