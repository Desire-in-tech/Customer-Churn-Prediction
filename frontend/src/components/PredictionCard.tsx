import { PredictionResult } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Info, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PredictionCard({ result }: { result: PredictionResult | null }) {
  if (!result) {
    return (
      <Card className="h-full border-dashed border-2 bg-transparent flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[400px]">
        <Activity className="w-12 h-12 mb-4 opacity-20" />
        <p>Submit profile to view prediction</p>
      </Card>
    );
  }

  const isHighRisk = result.riskLevel === "High";
  const isMediumRisk = result.riskLevel === "Medium";
  
  let colorClass = "text-green-500";
  let bgClass = "bg-green-500/10";
  let borderClass = "border-green-500/20";
  let Icon = CheckCircle2;

  if (isHighRisk) {
    colorClass = "text-red-500";
    bgClass = "bg-red-500/10";
    borderClass = "border-red-500/20";
    Icon = AlertCircle;
  } else if (isMediumRisk) {
    colorClass = "text-amber-500";
    bgClass = "bg-amber-500/10";
    borderClass = "border-amber-500/20";
    Icon = Info;
  }

  return (
    <Card className={`border shadow-lg ${borderClass} h-full relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${bgClass.replace('/10', '')}`} />
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          Assessment Result
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${bgClass} ${colorClass}`}>
            {result.riskLevel} Risk
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        
        <div className="flex flex-col items-center justify-center pt-4">
          <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * result.probability)}
                className={`transition-all duration-1000 ease-out ${colorClass}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-bold tracking-tighter ${colorClass}`}>
                {Math.round(result.probability * 100)}%
              </span>
              <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider mt-1">
                Churn Prob
              </span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 font-medium text-lg">
            <Icon className={`w-5 h-5 ${colorClass}`} />
            Model predicts: <span className={colorClass}>{result.prediction}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            Top Risk Factors
          </h4>
          <ul className="space-y-3">
            {result.factors.map((factor, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-mono text-muted-foreground">
                  {i + 1}
                </div>
                <span className="pt-0.5">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}
