"""Main backend logic — receives requests, validates, calls predictor, returns results."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import CustomerSerializer
from backend.ml.predictor import ChurnPredictor, ModelNotLoadedError

predictor = ChurnPredictor(
    model_path=str(settings.ML_MODEL_PATH),
    preprocessor_path=str(settings.ML_PREPROCESSOR_PATH),
)

_prediction_history = []
_history_counter = 0

DATASET_STATS = {
    "totalCustomers": 7043,
    "churnRate": 0.2654,
    "avgTenure": 32.37,
    "avgMonthlyCharges": 64.76,
    "highRiskCount": 1869,
    "contractBreakdown": [
        {"label": "Month-to-month", "count": 3875, "percentage": 55.0},
        {"label": "One year", "count": 1473, "percentage": 20.9},
        {"label": "Two year", "count": 1695, "percentage": 24.1},
    ],
    "internetServiceBreakdown": [
        {"label": "Fiber optic", "count": 3096, "percentage": 44.0},
        {"label": "DSL", "count": 2421, "percentage": 34.4},
        {"label": "No", "count": 1526, "percentage": 21.7},
    ],
}


@api_view(["GET"])
def health_check(request):
    """Health check endpoint."""
    return Response({"status": "ok"})


@api_view(["POST"])
def predict_customer(request):
    """
    Main prediction endpoint.

    Flow:
        Receive Request
         ↓
        Validate Data
         ↓
        Call Predictor
         ↓
        Return Results
    """
    global _history_counter

    serializer = CustomerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": str(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    customer_data = serializer.validated_data

    try:
        result = predictor.predict(customer_data)
    except ModelNotLoadedError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    _history_counter += 1
    record = {
        "id": _history_counter,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "prediction": result["prediction"],
        "probability": result["probability"],
        "riskLevel": result["riskLevel"],
        "tenure": customer_data.get("tenure"),
        "monthlyCharges": customer_data.get("MonthlyCharges"),
        "contract": customer_data.get("Contract"),
    }
    _prediction_history.insert(0, record)
    if len(_prediction_history) > 50:
        _prediction_history.pop()

    return Response(result, status=status.HTTP_200_OK)


@api_view(["GET"])
def dashboard_stats(request):
    """Return summary statistics from the IBM Telco dataset."""
    return Response(DATASET_STATS)


@api_view(["GET"])
def prediction_history(request):
    """Return up to 20 recent predictions."""
    return Response(_prediction_history[:20])
