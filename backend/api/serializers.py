"""Serializers for validating incoming customer data."""
from rest_framework import serializers


GENDER_CHOICES = ["Male", "Female"]
YES_NO = ["Yes", "No"]
YES_NO_NO_PHONE = ["Yes", "No", "No phone service"]
YES_NO_NO_INTERNET = ["Yes", "No", "No internet service"]
INTERNET_SERVICE_CHOICES = ["DSL", "Fiber optic", "No"]
CONTRACT_CHOICES = ["Month-to-month", "One year", "Two year"]
PAYMENT_CHOICES = [
    "Electronic check",
    "Mailed check",
    "Bank transfer (automatic)",
    "Credit card (automatic)",
]


class CustomerSerializer(serializers.Serializer):
    tenure = serializers.IntegerField(min_value=0, max_value=120)
    monthlyCharges = serializers.FloatField(min_value=0)
    totalCharges = serializers.FloatField(min_value=0)
    gender = serializers.ChoiceField(choices=GENDER_CHOICES)
    seniorCitizen = serializers.ChoiceField(choices=[0, 1])
    partner = serializers.ChoiceField(choices=YES_NO)
    dependents = serializers.ChoiceField(choices=YES_NO)
    phoneService = serializers.ChoiceField(choices=YES_NO)
    multipleLines = serializers.ChoiceField(choices=YES_NO_NO_PHONE)
    internetService = serializers.ChoiceField(choices=INTERNET_SERVICE_CHOICES)
    onlineSecurity = serializers.ChoiceField(choices=YES_NO_NO_INTERNET)
    onlineBackup = serializers.ChoiceField(choices=YES_NO_NO_INTERNET)
    deviceProtection = serializers.ChoiceField(choices=YES_NO_NO_INTERNET)
    techSupport = serializers.ChoiceField(choices=YES_NO_NO_INTERNET)
    streamingTV = serializers.ChoiceField(choices=YES_NO_NO_INTERNET)
    streamingMovies = serializers.ChoiceField(choices=YES_NO_NO_INTERNET)
    contract = serializers.ChoiceField(choices=CONTRACT_CHOICES)
    paperlessBilling = serializers.ChoiceField(choices=YES_NO)
    paymentMethod = serializers.ChoiceField(choices=PAYMENT_CHOICES)

    def to_internal_value(self, data):
        result = super().to_internal_value(data)
        result["SeniorCitizen"] = result.pop("seniorCitizen")
        result["tenure"] = result["tenure"]
        result["MonthlyCharges"] = result.pop("monthlyCharges")
        result["TotalCharges"] = result.pop("totalCharges")
        result["gender"] = result["gender"]
        result["Partner"] = result.pop("partner")
        result["Dependents"] = result.pop("dependents")
        result["PhoneService"] = result.pop("phoneService")
        result["MultipleLines"] = result.pop("multipleLines")
        result["InternetService"] = result.pop("internetService")
        result["OnlineSecurity"] = result.pop("onlineSecurity")
        result["OnlineBackup"] = result.pop("onlineBackup")
        result["DeviceProtection"] = result.pop("deviceProtection")
        result["TechSupport"] = result.pop("techSupport")
        result["StreamingTV"] = result.pop("streamingTV")
        result["StreamingMovies"] = result.pop("streamingMovies")
        result["Contract"] = result.pop("contract")
        result["PaperlessBilling"] = result.pop("paperlessBilling")
        result["PaymentMethod"] = result.pop("paymentMethod")
        return result
