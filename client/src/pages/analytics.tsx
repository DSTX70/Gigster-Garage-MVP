import { AppHeader } from "@/components/app-header";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

export default function AnalyticsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Tasks
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="mr-3" size={32} />
                Analytics & Insights
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive productivity analytics and performance metrics</p>
            </div>
          </div>
        </div>

        <AnalyticsCharts />
      </div>
    </div>
  );
}