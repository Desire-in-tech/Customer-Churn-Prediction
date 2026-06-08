"""Root URL configuration for the Customer Churn Prediction API."""
from django.urls import path, include

urlpatterns = [
    path("api/", include("api.urls")),
]
