"""URL routing for the prediction API."""
from django.urls import path
from . import views

urlpatterns = [
    path("predict/", views.predict_customer, name="predict"),
    path("dashboard/stats/", views.dashboard_stats, name="dashboard_stats"),
    path("predictions/history/", views.prediction_history, name="prediction_history"),
    path("healthz/", views.health_check, name="health_check"),
]
