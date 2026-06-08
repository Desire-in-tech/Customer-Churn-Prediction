import { Router } from "express";
import type { Request, Response } from "express";
import {
  PredictChurnBody,
  PredictChurnResponse,
  GetDashboardStatsResponse,
  GetPredictionHistoryResponseItem,
} from "@workspace/api-zod";

const router = Router();

interface PredictionRecord {
  id: number;
  timestamp: string;
  prediction: string;
  probability: number;
  riskLevel: string;
  tenure: number | null;
  monthlyCharges: number | null;
  contract: string | null;
}

let predictionHistory: PredictionRecord[] = [];
let historyCounter = 0;

function getRiskFactors(data: Record<string, unknown>): string[] {
  const factors: string[] = [];
  if (data["Contract"] === "Month-to-month") factors.push("Month-to-month contract");
  const tenure = Number(data["tenure"] ?? 100);
  if (tenure < 6) factors.push("New customer (0-6 months tenure)");
  else if (tenure < 12) factors.push("Short tenure (6-12 months)");
  const monthly = Number(data["MonthlyCharges"] ?? 0);
  if (monthly > 80) factors.push("High monthly charges (>$80)");
  else if (monthly > 65) factors.push("Above-average monthly charges");
  if (data["InternetService"] === "Fiber optic") factors.push("Fiber optic internet service");
  if (data["PaymentMethod"] === "Electronic check") factors.push("Electronic check payment");
  if (data["OnlineSecurity"] === "No") factors.push("No online security add-on");
  if (data["TechSupport"] === "No") factors.push("No tech support add-on");
  if (factors.length === 0) factors.push("No significant risk factors identified");
  return factors.slice(0, 5);
}

function computeProbability(data: Record<string, unknown>): number {
  let score = 0.15;
  if (data["Contract"] === "Month-to-month") score += 0.25;
  else if (data["Contract"] === "One year") score += 0.05;
  const tenure = Number(data["tenure"] ?? 24);
  if (tenure < 6) score += 0.20;
  else if (tenure < 12) score += 0.12;
  else if (tenure < 24) score += 0.05;
  const monthly = Number(data["MonthlyCharges"] ?? 50);
  if (monthly > 80) score += 0.15;
  else if (monthly > 60) score += 0.08;
  if (data["InternetService"] === "Fiber optic") score += 0.10;
  if (data["PaymentMethod"] === "Electronic check") score += 0.08;
  if (data["OnlineSecurity"] === "No") score += 0.05;
  if (data["TechSupport"] === "No") score += 0.05;
  if (data["SeniorCitizen"] === 1) score += 0.04;
  if (data["Partner"] === "No") score += 0.03;
  if (data["PaperlessBilling"] === "Yes") score += 0.03;
  return Math.min(score, 0.97);
}

function toSnakeCase(input: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    monthlyCharges: "MonthlyCharges",
    totalCharges: "TotalCharges",
    seniorCitizen: "SeniorCitizen",
    partner: "Partner",
    dependents: "Dependents",
    phoneService: "PhoneService",
    multipleLines: "MultipleLines",
    internetService: "InternetService",
    onlineSecurity: "OnlineSecurity",
    onlineBackup: "OnlineBackup",
    deviceProtection: "DeviceProtection",
    techSupport: "TechSupport",
    streamingTV: "StreamingTV",
    streamingMovies: "StreamingMovies",
    contract: "Contract",
    paperlessBilling: "PaperlessBilling",
    paymentMethod: "PaymentMethod",
  };
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    result[map[k] ?? k] = v;
  }
  return result;
}

router.post("/predict", (req: Request, res: Response) => {
  const parsed = PredictChurnBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const customerData = toSnakeCase(parsed.data as Record<string, unknown>);
  const probability = computeProbability(customerData);
  const prediction = probability >= 0.5 ? "Churn" : "Stay";
  const riskLevel = probability >= 0.7 ? "High" : probability >= 0.4 ? "Medium" : "Low";
  const factors = getRiskFactors(customerData);

  historyCounter++;
  const record: PredictionRecord = {
    id: historyCounter,
    timestamp: new Date().toISOString(),
    prediction,
    probability: Math.round(probability * 10000) / 10000,
    riskLevel,
    tenure: Number(parsed.data.tenure) ?? null,
    monthlyCharges: Number(parsed.data.monthlyCharges) ?? null,
    contract: String(parsed.data.contract) ?? null,
  };
  predictionHistory.unshift(record);
  if (predictionHistory.length > 50) predictionHistory.pop();

  const result = {
    prediction,
    probability: Math.round(probability * 10000) / 10000,
    riskLevel,
    factors,
  };

  res.json(result);
});

router.get("/dashboard/stats", (_req: Request, res: Response) => {
  res.json({
    totalCustomers: 7043,
    churnRate: 0.2654,
    avgTenure: 32.37,
    avgMonthlyCharges: 64.76,
    highRiskCount: 1869,
    contractBreakdown: [
      { label: "Month-to-month", count: 3875, percentage: 55.0 },
      { label: "One year", count: 1473, percentage: 20.9 },
      { label: "Two year", count: 1695, percentage: 24.1 },
    ],
    internetServiceBreakdown: [
      { label: "Fiber optic", count: 3096, percentage: 44.0 },
      { label: "DSL", count: 2421, percentage: 34.4 },
      { label: "No", count: 1526, percentage: 21.7 },
    ],
  });
});

router.get("/predictions/history", (_req: Request, res: Response) => {
  res.json(predictionHistory.slice(0, 20));
});

export default router;
