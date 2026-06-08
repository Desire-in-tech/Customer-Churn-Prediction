# Dataset

Download the **IBM Telco Customer Churn** dataset from Kaggle and save it here as `telco_churn.csv`.

**Kaggle URL:** https://www.kaggle.com/datasets/blastchar/telco-customer-churn

**Expected filename:** `data/telco_churn.csv`

**Dataset size:** ~7,043 rows × 21 columns

## Columns

| Column | Type | Description |
|--------|------|-------------|
| customerID | string | Unique customer identifier (dropped during cleaning) |
| gender | string | Male / Female |
| SeniorCitizen | int | 0 = No, 1 = Yes |
| Partner | string | Yes / No |
| Dependents | string | Yes / No |
| tenure | int | Months with company |
| PhoneService | string | Yes / No |
| MultipleLines | string | Yes / No / No phone service |
| InternetService | string | DSL / Fiber optic / No |
| OnlineSecurity | string | Yes / No / No internet service |
| OnlineBackup | string | Yes / No / No internet service |
| DeviceProtection | string | Yes / No / No internet service |
| TechSupport | string | Yes / No / No internet service |
| StreamingTV | string | Yes / No / No internet service |
| StreamingMovies | string | Yes / No / No internet service |
| Contract | string | Month-to-month / One year / Two year |
| PaperlessBilling | string | Yes / No |
| PaymentMethod | string | Electronic check / Mailed check / Bank transfer / Credit card |
| MonthlyCharges | float | Monthly bill amount |
| TotalCharges | string | Total amount charged (may need type conversion) |
| Churn | string | **Target**: Yes / No |
