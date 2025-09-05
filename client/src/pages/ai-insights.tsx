import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, DollarSign, Target, Lightbulb, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface AIInsight {
  id: string;
  type: 'productivity' | 'financial' | 'project' | 'workflow' | 'opportunity';
  title: string;
  description: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  actionItems: string[];
  confidence: number;
  createdAt: string;
}

const insightTypeIcons = {
  productivity: TrendingUp,
  financial: DollarSign,
  project: Target,
  workflow: RefreshCw,
  opportunity: Lightbulb
};

const priorityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary'
} as const;

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const { data: insights = [], refetch, isLoading } = useQuery<AIInsight[]>({
    queryKey: ['/api/ai-insights'],
    enabled: !!user
  });

  const { data: recommendations = [] } = useQuery<string[]>({
    queryKey: ['/api/ai-insights/recommendations'],
    enabled: !!user
  });

  const handleRefreshInsights = async () => {
    setRefreshing(true);
    try {
      await apiRequest('POST', '/api/ai-insights/refresh');
      await refetch();
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) acc[insight.type] = [];
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, AIInsight[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
        <AppHeader />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Brain className="h-12 w-12 animate-pulse text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Generating AI insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Powered Insights</h1>
            <p className="text-gray-600">Intelligent analytics and recommendations powered by GPT-4</p>
          </div>
          <Button 
            onClick={handleRefreshInsights}
            disabled={refreshing}
            className="bg-teal-600 hover:bg-teal-700"
            data-testid="button-refresh-insights"
          >
            <Brain className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Analyzing...' : 'Refresh Insights'}
          </Button>
        </div>

        {/* Quick Recommendations */}
        {recommendations.length > 0 && (
          <Card className="mb-8 border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center text-teal-800">
                <Lightbulb className="h-5 w-5 mr-2" />
                Smart Recommendations
              </CardTitle>
              <CardDescription className="text-teal-700">
                AI-generated tasks based on your current workload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-teal-200">
                    <CheckCircle className="h-5 w-5 text-teal-600 mr-3" />
                    <span className="text-gray-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights Dashboard */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Insights</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="project">Projects</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="opportunity">Opportunities</TabsTrigger>
          </TabsList>

          {/* All Insights */}
          <TabsContent value="all">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight) => {
                const Icon = insightTypeIcons[insight.type];
                return (
                  <Card 
                    key={insight.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedInsight(insight)}
                    data-testid={`card-insight-${insight.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Icon className="h-6 w-6 text-teal-600" />
                        <Badge variant={priorityColors[insight.priority]}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Recommendation</h4>
                          <p className="text-sm text-gray-600">{insight.recommendation}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                          <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Type-specific tabs */}
          {Object.entries(groupedInsights).map(([type, typeInsights]) => (
            <TabsContent key={type} value={type}>
              <div className="grid gap-6 md:grid-cols-2">
                {typeInsights.map((insight) => {
                  const Icon = insightTypeIcons[insight.type];
                  return (
                    <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Icon className="h-6 w-6 text-teal-600" />
                          <Badge variant={priorityColors[insight.priority]}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <CardTitle>{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Recommendation</h4>
                          <p className="text-sm text-gray-600">{insight.recommendation}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Expected Impact</h4>
                          <p className="text-sm text-gray-600">{insight.impact}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Action Items</h4>
                          <ul className="space-y-1">
                            {insight.actionItems.map((item, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-600">
                                <AlertTriangle className="h-3 w-3 mt-1 mr-2 text-amber-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                          <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Empty State */}
        {insights.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Insights Yet</h3>
              <p className="text-gray-600 mb-6">
                Generate your first AI insights by clicking the refresh button above
              </p>
              <Button 
                onClick={handleRefreshInsights}
                disabled={refreshing}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}