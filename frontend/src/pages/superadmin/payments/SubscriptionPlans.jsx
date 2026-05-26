import React from "react";
import { ChevronLeft, Award, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

export default function SubscriptionPlans({
  plans = [],
  onBack,
}) {
  return (
    <div className="space-y-6" id="subscription-plans-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Subscription Tiers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id} className="relative overflow-hidden hover:shadow-xl transition-all border hover:border-blue-500/30 flex flex-col justify-between h-full bg-card">
            <div>
              <CardHeader className="pb-4 border-b text-center">
                <Badge variant="secondary" className="mb-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-0 font-bold px-3 py-0.5">
                  {plan.name} Tier
                </Badge>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-extrabold text-foreground">${plan.price}</span>
                  <span className="text-xs text-muted-foreground">/ {plan.durationMonths} Mon</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 text-sm">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Configure Pricing
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
