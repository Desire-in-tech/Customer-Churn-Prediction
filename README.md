# Customer Churn Prediction System

> Predict which telecom customers are likely to leave — and why.

A full-stack ML application built with **React**, **Django REST Framework**, and **XGBoost**. Given a customer's account details, the system predicts churn probability, assigns a risk level (Low / Medium / High), and surfaces the top SHAP-derived risk factors driving the prediction.

---

## Project Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | Customer form, prediction display, dashboard |
| Backend | Django REST Framework | Validation, preprocessing, model inference |
| ML Model | XGBoost + SHAP | Binary churn classification + explainability |
| Dataset | IBM Telco Customer Churn | 7,043 customer records |

## Business Problem

Telecom companies lose \$1,000–\$3,000 per churned customer in acquisition costs alone. This system:

- Identifies at-risk customers **before** they cancel
- Explains **why** they are at risk (SHAP)
- Provides **actionable retention strategies** for each risk factor

---

## Project Structure

```
customer-churn-app/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Predict.tsx
│   │   ├── components/
│   │   │   ├── CustomerForm.tsx
│   │   │   └── PredictionCard.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── api/
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── serializers.py
│   ├── ml/
│   │   ├── predictor.py
│   │   ├── model.pkl
│   │   └── preprocessor.pkl
│   ├── settings.py
│   ├── manage.py
│   └── requirements.txt
│
├── notebooks/
│   └── churn_model.ipynb
│
├── data/
│   └── telco_churn.csv
│
├── README.md
├── render.yaml
└── .gitignore
```

---

## ML Pipeline (Notebook)

The notebook `notebooks/churn_model.ipynb` covers the full pipeline:

1. **Import Libraries** — pandas, numpy, sklearn, xgboost, shap, imbalanced-learn
2. **Load Dataset** — Read IBM Telco CSV, inspect shape/types
3. **EDA** — Churn distribution, contract type vs churn, tenure & charges distributions, correlation heatmap
4. **Data Cleaning** — Fix TotalCharges dtype, handle nulls, drop customerID
5. **Feature Engineering** — Tenure groups, avg monthly spend, service count flags, contract risk score, customer value segment
6. **Preprocessing** — OneHotEncoder + StandardScaler via ColumnTransformer pipeline
7. **Train-Test Split** — 80/20 stratified split
8. **Balance Classes** — SMOTE oversampling
9. **Model Training** — XGBoost classifier
10. **Model Evaluation** — Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix, ROC curve
11. **SHAP Analysis** — Global summary plots, feature importance bar chart, local force plot, waterfall plot
12. **Business Insights** — Retention strategy recommendations per risk factor
13. **Save Artifacts** — `model.pkl` and `preprocessor.pkl` to `backend/ml/`

---

## Setup & Running

### 1. Download the Dataset

Download the **IBM Telco Customer Churn** dataset from Kaggle:

```
https://www.kaggle.com/datasets/blastchar/telco-customer-churn
```

Save it as: `data/telco_churn.csv`

### 2. Train the Model (Google Colab / Jupyter)

Open `notebooks/churn_model.ipynb` and run all cells. The notebook saves:
- `backend/ml/model.pkl`
- `backend/ml/preprocessor.pkl`

### 3. Run the Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### 4. Run the Frontend

Set the backend API URL, then run the Vite app:

```bash
cd frontend
npm install
npm run dev
```

For local development, create a `.env` file in `frontend/` with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## API Reference

### `POST /api/predict/`

Predict churn for a single customer.

**Request Body:**
```json
{
  "tenure": 2,
  "monthlyCharges": 95.0,
  "totalCharges": 190.0,
  "gender": "Male",
  "seniorCitizen": 0,
  "partner": "No",
  "dependents": "No",
  "phoneService": "Yes",
  "multipleLines": "No",
  "internetService": "Fiber optic",
  "onlineSecurity": "No",
  "onlineBackup": "No",
  "deviceProtection": "No",
  "techSupport": "No",
  "streamingTV": "No",
  "streamingMovies": "No",
  "contract": "Month-to-month",
  "paperlessBilling": "Yes",
  "paymentMethod": "Electronic check"
}
```

**Response:**
```json
{
  "prediction": "Churn",
  "probability": 0.89,
  "riskLevel": "High",
  "factors": [
    "Month-to-month contract",
    "New customer (0-6 months tenure)",
    "High monthly charges (>$80)",
    "Fiber optic internet service",
    "Electronic check payment"
  ]
}
```

### `GET /api/dashboard/stats/`

Returns aggregate statistics from the IBM Telco dataset.

### `GET /api/predictions/history/`

Returns the 20 most recent predictions made in this session.

---

## Model Performance

After training with the full IBM Telco dataset, typical results:

| Metric | Score |
|--------|-------|
| Accuracy | ~82% |
| Precision | ~70% |
| Recall | ~78% |
| F1 Score | ~74% |
| ROC-AUC | ~85% |

> These improve with hyperparameter tuning.

---

## Business Insights

| SHAP Finding | Business Recommendation |
|---|---|
| Month-to-month contracts → high churn | Offer 15% discount for annual contract upgrade |
| Short tenure → high churn | Improve onboarding: proactive check-ins at 30/60/90 days |
| High monthly charges → high churn | Introduce loyalty discount tiers for high-spend customers |
| Fiber optic without security add-ons → churn | Bundle security services with fiber plans |
| Electronic check payment → churn | Incentivize auto-pay enrollment with a billing credit |

---

## Deployment on Render

1. Push this repository to GitHub
2. Connect the GitHub repo to [Render](https://render.com)
3. Use the included `render.yaml`, which creates:
   - **Web Service**: Django API from `backend/`
   - **Static Site**: React app from `frontend/`

Before deploying, run the notebook and commit these generated files:
- `backend/ml/model.pkl`
- `backend/ml/preprocessor.pkl`

---

## Tech Stack

- **React** + Vite + TailwindCSS
- **Django** 4.2 + Django REST Framework
- **XGBoost** 2.0
- **scikit-learn** + imbalanced-learn (SMOTE)
- **SHAP** (explainability)
- **pandas** + numpy
