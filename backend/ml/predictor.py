"""
Bridge between Django and the ML model.

Loads model.pkl and preprocessor.pkl once at startup.
Provides a predict() method that preprocesses raw customer data
and returns prediction, probability, risk level, and SHAP-derived factors.
"""
import os
from pathlib import Path

import numpy as np
import pandas as pd

try:
    import joblib
    import shap

    LIBS_AVAILABLE = True
except ImportError:
    LIBS_AVAILABLE = False

FEATURE_LABELS = {
    "tenure": "Customer tenure",
    "MonthlyCharges": "Monthly charges",
    "TotalCharges": "Total charges",
    "Contract_Month-to-month": "Month-to-month contract",
    "Contract_One year": "One-year contract",
    "Contract_Two year": "Two-year contract",
    "InternetService_Fiber optic": "Fiber optic internet",
    "InternetService_DSL": "DSL internet",
    "PaymentMethod_Electronic check": "Electronic check payment",
    "OnlineSecurity_No": "No online security",
    "TechSupport_No": "No tech support",
    "SeniorCitizen": "Senior citizen",
    "Partner_Yes": "Has partner",
    "Dependents_Yes": "Has dependents",
    "tenure_group_0-12": "New customer (0-12 months)",
    "tenure_group_13-24": "Early customer (13-24 months)",
    "tenure_group_25-48": "Mid-tenure customer",
    "tenure_group_48+": "Long-term customer",
    "avg_monthly_spend": "Average monthly spend",
    "has_multiple_services": "Has multiple services",
    "contract_risk_score": "High contract risk",
    "customer_value_segment_Low": "Low value customer",
    "customer_value_segment_High": "High value customer",
}

RISK_FACTOR_DESCRIPTIONS = {
    "Contract_Month-to-month": "Month-to-month contract",
    "InternetService_Fiber optic": "Fiber optic internet service",
    "PaymentMethod_Electronic check": "Electronic check payment",
    "OnlineSecurity_No": "No online security add-on",
    "TechSupport_No": "No tech support add-on",
    "tenure": "Low customer tenure",
    "MonthlyCharges": "High monthly charges",
    "contract_risk_score": "High-risk contract type",
    "tenure_group_0-12": "New customer (high churn risk period)",
}


class ModelNotLoadedError(Exception):
    """Raised when the model files are not yet available."""
    pass


class ChurnPredictor:
    """
    Loads model.pkl and preprocessor.pkl once and exposes a predict() method.

    Example usage:
        predictor = ChurnPredictor(model_path="ml/model.pkl", preprocessor_path="ml/preprocessor.pkl")
        result = predictor.predict(customer_data_dict)
    """

    def __init__(self, model_path: str, preprocessor_path: str):
        self.model_path = Path(model_path)
        self.preprocessor_path = Path(preprocessor_path)
        self.model = None
        self.preprocessor = None
        self.explainer = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Load model and preprocessor from disk. Called once at startup."""
        if not LIBS_AVAILABLE:
            return

        if self.model_path.exists() and self.preprocessor_path.exists():
            self.model = joblib.load(self.model_path)
            self.preprocessor = joblib.load(self.preprocessor_path)
            try:
                self.explainer = shap.TreeExplainer(self.model)
            except Exception:
                self.explainer = None
        else:
            pass

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply the same feature engineering as in the notebook."""
        df = df.copy()

        def tenure_group(t):
            if t <= 12:
                return "0-12"
            elif t <= 24:
                return "13-24"
            elif t <= 48:
                return "25-48"
            else:
                return "48+"

        df["tenure_group"] = df["tenure"].apply(tenure_group)

        df["avg_monthly_spend"] = df.apply(
            lambda r: r["TotalCharges"] / r["tenure"] if r["tenure"] > 0 else r["MonthlyCharges"],
            axis=1,
        )

        service_cols = [
            "PhoneService", "MultipleLines", "OnlineSecurity", "OnlineBackup",
            "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
        ]
        df["has_multiple_services"] = df[service_cols].apply(
            lambda row: int(sum(v == "Yes" for v in row) >= 3), axis=1
        )

        df["contract_risk_score"] = df["Contract"].map(
            {"Month-to-month": 1, "One year": 0.5, "Two year": 0}
        ).fillna(0)

        total = df["TotalCharges"]
        df["customer_value_segment"] = pd.cut(
            total,
            bins=[-1, 500, 3000, float("inf")],
            labels=["Low", "Medium", "High"],
        )

        return df

    def _get_rule_based_factors(self, customer_data: dict) -> list:
        """Generate risk factor explanations from business rules when SHAP is unavailable."""
        factors = []

        if customer_data.get("Contract") == "Month-to-month":
            factors.append("Month-to-month contract")
        if customer_data.get("tenure", 100) < 12:
            factors.append("New customer (0-12 months tenure)")
        if customer_data.get("MonthlyCharges", 0) > 70:
            factors.append("High monthly charges")
        if customer_data.get("InternetService") == "Fiber optic":
            factors.append("Fiber optic internet service")
        if customer_data.get("PaymentMethod") == "Electronic check":
            factors.append("Electronic check payment method")
        if customer_data.get("OnlineSecurity") == "No":
            factors.append("No online security add-on")
        if customer_data.get("TechSupport") == "No":
            factors.append("No tech support add-on")

        return factors[:5] if factors else ["No significant risk factors identified"]

    def predict(self, customer_data: dict) -> dict:
        """
        Run inference on a single customer record.

        Args:
            customer_data: Dict with column names matching the IBM Telco dataset.

        Returns:
            {
                "prediction": "Churn" | "Stay",
                "probability": float (0-1),
                "riskLevel": "Low" | "Medium" | "High",
                "factors": list[str]
            }
        """
        if self.model is None or self.preprocessor is None:
            probability = self._rule_based_probability(customer_data)
            factors = self._get_rule_based_factors(customer_data)
        else:
            df = pd.DataFrame([customer_data])
            df = self._engineer_features(df)

            transformed = self.preprocessor.transform(df)
            probability = float(self.model.predict_proba(transformed)[0][1])

            if self.explainer is not None:
                try:
                    shap_values = self.explainer.shap_values(transformed)
                    if isinstance(shap_values, list):
                        sv = shap_values[1][0]
                    else:
                        sv = shap_values[0]

                    try:
                        feature_names = self.preprocessor.get_feature_names_out()
                    except Exception:
                        feature_names = [f"feature_{i}" for i in range(len(sv))]

                    top_indices = np.argsort(np.abs(sv))[::-1][:5]
                    factors = []
                    for idx in top_indices:
                        if sv[idx] > 0 and idx < len(feature_names):
                            raw_name = str(feature_names[idx]).replace("remainder__", "").replace("onehot__", "").replace("num__", "")
                            label = RISK_FACTOR_DESCRIPTIONS.get(raw_name, raw_name.replace("_", " ").title())
                            factors.append(label)

                    if not factors:
                        factors = self._get_rule_based_factors(customer_data)
                except Exception:
                    factors = self._get_rule_based_factors(customer_data)
            else:
                factors = self._get_rule_based_factors(customer_data)

        if probability >= 0.7:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        prediction = "Churn" if probability >= 0.5 else "Stay"

        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "riskLevel": risk_level,
            "factors": factors,
        }

    def _rule_based_probability(self, customer_data: dict) -> float:
        """
        Heuristic probability when the model file isn't loaded yet.
        Useful for development/demo before training the model.
        """
        score = 0.15

        if customer_data.get("Contract") == "Month-to-month":
            score += 0.25
        elif customer_data.get("Contract") == "One year":
            score += 0.05

        tenure = customer_data.get("tenure", 24)
        if tenure < 6:
            score += 0.20
        elif tenure < 12:
            score += 0.12
        elif tenure < 24:
            score += 0.05

        monthly = customer_data.get("MonthlyCharges", 50)
        if monthly > 80:
            score += 0.15
        elif monthly > 60:
            score += 0.08

        if customer_data.get("InternetService") == "Fiber optic":
            score += 0.10

        if customer_data.get("PaymentMethod") == "Electronic check":
            score += 0.08

        if customer_data.get("OnlineSecurity") == "No":
            score += 0.05
        if customer_data.get("TechSupport") == "No":
            score += 0.05

        return min(score, 0.97)
