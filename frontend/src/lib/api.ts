import { useMutation, useQuery } from "@tanstack/react-query";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export enum CustomerInputGender {
  Male = "Male",
  Female = "Female",
}

export enum CustomerInputPartner {
  Yes = "Yes",
  No = "No",
}

export enum CustomerInputDependents {
  Yes = "Yes",
  No = "No",
}

export enum CustomerInputPhoneService {
  Yes = "Yes",
  No = "No",
}

export enum CustomerInputMultipleLines {
  Yes = "Yes",
  No = "No",
  NoPhoneService = "No phone service",
}

export enum CustomerInputInternetService {
  DSL = "DSL",
  FiberOptic = "Fiber optic",
  No = "No",
}

export enum CustomerInputOnlineSecurity {
  Yes = "Yes",
  No = "No",
  NoInternetService = "No internet service",
}

export enum CustomerInputOnlineBackup {
  Yes = "Yes",
  No = "No",
  NoInternetService = "No internet service",
}

export enum CustomerInputDeviceProtection {
  Yes = "Yes",
  No = "No",
  NoInternetService = "No internet service",
}

export enum CustomerInputTechSupport {
  Yes = "Yes",
  No = "No",
  NoInternetService = "No internet service",
}

export enum CustomerInputStreamingTV {
  Yes = "Yes",
  No = "No",
  NoInternetService = "No internet service",
}

export enum CustomerInputStreamingMovies {
  Yes = "Yes",
  No = "No",
  NoInternetService = "No internet service",
}

export enum CustomerInputContract {
  MonthToMonth = "Month-to-month",
  OneYear = "One year",
  TwoYear = "Two year",
}

export enum CustomerInputPaperlessBilling {
  Yes = "Yes",
  No = "No",
}

export enum CustomerInputPaymentMethod {
  ElectronicCheck = "Electronic check",
  MailedCheck = "Mailed check",
  BankTransferAutomatic = "Bank transfer (automatic)",
  CreditCardAutomatic = "Credit card (automatic)",
}

export type CustomerInput = {
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  gender: CustomerInputGender | "Male" | "Female";
  seniorCitizen: 0 | 1 | number;
  partner: CustomerInputPartner | "Yes" | "No";
  dependents: CustomerInputDependents | "Yes" | "No";
  phoneService: CustomerInputPhoneService | "Yes" | "No";
  multipleLines: CustomerInputMultipleLines | "Yes" | "No" | "No phone service";
  internetService: CustomerInputInternetService | "DSL" | "Fiber optic" | "No";
  onlineSecurity: CustomerInputOnlineSecurity | "Yes" | "No" | "No internet service";
  onlineBackup: CustomerInputOnlineBackup | "Yes" | "No" | "No internet service";
  deviceProtection: CustomerInputDeviceProtection | "Yes" | "No" | "No internet service";
  techSupport: CustomerInputTechSupport | "Yes" | "No" | "No internet service";
  streamingTV: CustomerInputStreamingTV | "Yes" | "No" | "No internet service";
  streamingMovies: CustomerInputStreamingMovies | "Yes" | "No" | "No internet service";
  contract: CustomerInputContract | "Month-to-month" | "One year" | "Two year";
  paperlessBilling: CustomerInputPaperlessBilling | "Yes" | "No";
  paymentMethod:
    | CustomerInputPaymentMethod
    | "Electronic check"
    | "Mailed check"
    | "Bank transfer (automatic)"
    | "Credit card (automatic)";
};

export type PredictionResult = {
  prediction: "Churn" | "Stay";
  probability: number;
  riskLevel: "Low" | "Medium" | "High";
  factors: string[];
};

export type PredictionRecord = {
  id: number;
  timestamp: string;
  prediction: string;
  probability: number;
  riskLevel: string;
  tenure?: number | null;
  monthlyCharges?: number | null;
  contract?: string | null;
};

export type BreakdownItem = {
  label: string;
  count: number;
  percentage: number;
};

export type DashboardStats = {
  totalCustomers: number;
  churnRate: number;
  avgTenure: number;
  avgMonthlyCharges: number;
  highRiskCount: number;
  contractBreakdown: BreakdownItem[];
  internetServiceBreakdown: BreakdownItem[];
};

export function getGetPredictionHistoryQueryKey() {
  return ["/api/predictions/history"] as const;
}

export function usePredictChurn() {
  return useMutation({
    mutationFn: ({ data }: { data: CustomerInput }) =>
      request<PredictionResult>("/api/predict", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useGetDashboardStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => request<DashboardStats>("/api/dashboard/stats"),
  });
}

export function useGetPredictionHistory() {
  return useQuery({
    queryKey: getGetPredictionHistoryQueryKey(),
    queryFn: () => request<PredictionRecord[]>("/api/predictions/history"),
  });
}
