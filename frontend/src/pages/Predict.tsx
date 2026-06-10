import { useState } from "react";
import CustomerForm from "@/components/CustomerForm";
import PredictionCard from "@/components/PredictionCard";
import { PredictionResult } from "@/lib/api";

export default function Predict() {
  const [result, setResult] = useState<PredictionResult | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Predict Risk</h1>
        <p className="text-muted-foreground mt-1">Enter customer profile data to generate a real-time churn probability and risk factors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <CustomerForm onResult={setResult} />
        </div>
        <div className="lg:col-span-1">
          <PredictionCard result={result} />
        </div>
      </div>
    </div>
  );
}
