import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { TimerWidget } from "@/components/timer-widget";
import { StreakCard } from "@/components/streak-card";
import { DailyReminder } from "@/components/daily-reminder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { Clock, TrendingUp, Calendar, BarChart3, Edit, Trash2, ArrowLeft, CheckCircle, XCircle, FileText, DollarSign } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import type { TimeLog } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ProductivityStats {
  totalHours: number;
  averageDailyHours: number;
  streakDays: number;
  utilizationPercent: number;
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export default function ProductivityPage() {
  const [, navigate] = useLocation();
  const [selectedForInvoice, setSelectedForInvoice] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Fetch recent time logs
  const { data: timeLogs = [], isLoading: timeLogsLoading, isError: timeLogsError } = useQuery<TimeLog[]>({
    queryKey: ["/api/timelogs"],
    staleTime: 1000 * 60 * 2, // 2 minutes to reduce frequent refetching
    refetchInterval: 1000 * 30, // Refetch every 30 seconds instead of constantly
  });

  // Fetch productivity stats for different periods
  const { data: stats7Days, isLoading: stats7Loading } = useQuery<ProductivityStats>({
    queryKey: ["/api/productivity/stats", { days: 7 }],
    staleTime: 1000 * 60 * 5, // 5 minutes stale time for stats
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  const { data: stats30Days, isLoading: stats30Loading } = useQuery<ProductivityStats>({
    queryKey: ["/api/productivity/stats", { days: 30 }],
    staleTime: 1000 * 60 * 5, // 5 minutes stale time for stats
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  // Calculate running total of hours
  const totalHours = timeLogs.reduce((total, log) => {
    if (log.duration) {
      return total + parseInt(log.duration);
    }
    return total;
  }, 0);

  const formatTotalDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Filter time logs based on approval status
  const filteredTimeLogs = timeLogs.filter(log => {
    if (activeTab === "all") return true;
    return log.approvalStatus === activeTab;
  });

  // Approval mutation
  const approveTimeLogMutation = useMutation({
    mutationFn: async ({ timeLogId, status }: { timeLogId: string; status: "approved" | "rejected" }) => {
      return apiRequest("POST", `/api/timelogs/${timeLogId}/approve`, { 
        approvalStatus: status 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs"] });
    },
  });

  // Invoice selection mutation
  const updateInvoiceSelectionMutation = useMutation({
    mutationFn: async ({ timeLogIds, selected }: { timeLogIds: string[]; selected: boolean }) => {
      return apiRequest("POST", "/api/timelogs/invoice-selection", { 
        timeLogIds, 
        isSelectedForInvoice: selected 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs"] });
      setSelectedForInvoice(new Set());
    },
  });

  const handleApproval = (timeLogId: string, status: "approved" | "rejected") => {
    approveTimeLogMutation.mutate({ timeLogId, status });
  };

  const handleInvoiceSelection = (timeLogId: string, selected: boolean) => {
    const newSelection = new Set(selectedForInvoice);
    if (selected) {
      newSelection.add(timeLogId);
    } else {
      newSelection.delete(timeLogId);
    }
    setSelectedForInvoice(newSelection);
  };

  const handleBulkInvoiceUpdate = () => {
    if (selectedForInvoice.size > 0) {
      updateInvoiceSelectionMutation.mutate({ 
        timeLogIds: Array.from(selectedForInvoice), 
        selected: true 
      });
    }
  };

  // Delete time log mutation
  const deleteTimeLogMutation = useMutation({
    mutationFn: async (timeLogId: string) => {
      return apiRequest("DELETE", `/api/timelogs/${timeLogId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs"] });
      toast({ title: "Success", description: "Time log deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete time log", variant: "destructive" });
    },
  });

  // Update time log mutation
  const updateTimeLogMutation = useMutation({
    mutationFn: async ({ timeLogId, description, notes }: { timeLogId: string; description: string; notes: string }) => {
      return apiRequest("PUT", `/api/timelogs/${timeLogId}`, { description, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs"] });
      toast({ title: "Success", description: "Time log updated successfully" });
      setEditingLog(null);
      setEditNotes("");
      setEditDescription("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update time log", variant: "destructive" });
    },
  });

  const handleDelete = (timeLogId: string) => {
    if (confirm("Are you sure you want to delete this time log entry?")) {
      deleteTimeLogMutation.mutate(timeLogId);
    }
  };

  const handleEdit = (log: TimeLog) => {
    setEditingLog(log);
    setEditDescription(log.description || "");
    setEditNotes(log.notes || "");
  };

  const handleSaveEdit = () => {
    if (editingLog) {
      updateTimeLogMutation.mutate({
        timeLogId: editingLog.id,
        description: editDescription,
        notes: editNotes
      });
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--cream-card)'}} data-testid="productivity-page">
      <AppHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h2 className="text-2xl font-bold brand-heading" data-testid="page-title">
                Time & Productivity Tools
              </h2>
              <p className="text-gray-700 text-sm">
                Track your time, maintain productivity streaks, and stay focused on your goals.
              </p>
            </div>
          </div>
        </div>

        {/* Top Widget Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Timer Widget */}
          <div className="lg:col-span-1">
            <TimerWidget />
          </div>
          
          {/* Streak Card */}
          <div className="lg:col-span-1">
            <StreakCard />
          </div>
          
          {/* Daily Reminder */}
          <div className="lg:col-span-1">
            <DailyReminder />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="gigster-card" data-testid="stat-card-running-total">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Running Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeLogsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold brand-heading text-blue-600" data-testid="stat-running-total">
                    {formatTotalDuration(totalHours)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    All time entries
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="gigster-card" data-testid="stat-card-7days">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last 7 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats7Loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold brand-heading" data-testid="stat-hours-7days">
                    {stats7Days ? `${stats7Days.totalHours}h` : "0h"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Avg: {stats7Days ? `${stats7Days.averageDailyHours}h/day` : "0h/day"}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="gigster-card" data-testid="stat-card-30days">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Last 30 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats30Loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold brand-heading" data-testid="stat-hours-30days">
                    {stats30Days ? `${stats30Days.totalHours}h` : "0h"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Utilization: {stats30Days ? `${stats30Days.utilizationPercent}%` : "0%"}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="gigster-card" data-testid="stat-card-streak">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Streak Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold brand-heading" data-testid="stat-streak-days">
                {stats7Days ? stats7Days.streakDays : 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Current streak
              </div>
            </CardContent>
          </Card>

          <Card className="gigster-card" data-testid="stat-card-total-logs">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Total Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold brand-heading" data-testid="stat-total-sessions">
                {timeLogs.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Time entries
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Time Logs Management */}
        <Card className="gigster-card" data-testid="enhanced-timelogs-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="brand-heading flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Time Logs Management</span>
              </CardTitle>
              {selectedForInvoice.size > 0 && (
                <Button
                  onClick={handleBulkInvoiceUpdate}
                  disabled={updateInvoiceSelectionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-add-to-invoice"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add {selectedForInvoice.size} to Invoice
                </Button>
              )}
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab as any} className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" data-testid="tab-all">All ({timeLogs.length})</TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({timeLogs.filter(log => log.approvalStatus === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="approved" data-testid="tab-approved">
                  Approved ({timeLogs.filter(log => log.approvalStatus === "approved").length})
                </TabsTrigger>
                <TabsTrigger value="rejected" data-testid="tab-rejected">
                  Rejected ({timeLogs.filter(log => log.approvalStatus === "rejected").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {timeLogsLoading ? (
              <div className="flex items-center justify-center py-8" data-testid="timelogs-loading">
                <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full" />
              </div>
            ) : filteredTimeLogs.length === 0 ? (
              <div className="text-center py-8 text-orange-700" data-testid="no-timelogs">
                <Clock className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                <p className="text-lg font-medium mb-2">No time logs found</p>
                <p className="text-sm">
                  {activeTab === "all" 
                    ? "Start your first timer to begin tracking your productivity!"
                    : `No ${activeTab} time logs available.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="timelogs-list">
                {filteredTimeLogs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      log.approvalStatus === "approved" 
                        ? "bg-green-50 border-green-200" 
                        : log.approvalStatus === "rejected"
                        ? "bg-red-50 border-red-200"
                        : "bg-orange-50 border-orange-100"
                    }`}
                    data-testid={`timelog-${log.id}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Invoice Selection Checkbox */}
                      {log.approvalStatus === "approved" && (
                        <Checkbox
                          checked={selectedForInvoice.has(log.id) || Boolean(log.isSelectedForInvoice)}
                          onCheckedChange={(checked) => handleInvoiceSelection(log.id, Boolean(checked))}
                          disabled={Boolean(log.isSelectedForInvoice)}
                          data-testid={`checkbox-invoice-${log.id}`}
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="font-medium brand-heading">
                              {log.description || "Untitled session"}
                            </div>
                            <div className="text-sm text-orange-700 mt-1">
                              {format(new Date(log.startTime), "MMM dd, yyyy 'at' h:mm a")}
                              {log.endTime && ` - ${format(new Date(log.endTime), "h:mm a")}`}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Approval Status Badge */}
                            <Badge 
                              className={
                                log.approvalStatus === "approved" 
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : log.approvalStatus === "rejected"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }
                            >
                              {log.approvalStatus}
                            </Badge>

                            {log.projectId && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                Project ID: {log.projectId}
                              </Badge>
                            )}
                            
                            {log.isActive ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Running
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-orange-300 text-orange-700">
                                {log.duration ? formatDuration(parseInt(log.duration)) : "0m"}
                              </Badge>
                            )}
                            
                            {log.isSelectedForInvoice && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                <FileText className="h-3 w-3 mr-1" />
                                In Invoice
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Approval Controls */}
                      {log.approvalStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApproval(log.id, "approved")}
                            disabled={approveTimeLogMutation.isPending}
                            className="text-green-600 hover:bg-green-100"
                            data-testid={`button-approve-${log.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApproval(log.id, "rejected")}
                            disabled={approveTimeLogMutation.isPending}
                            className="text-red-600 hover:bg-red-100"
                            data-testid={`button-reject-${log.id}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(log)}
                        className="text-gray-600 hover:bg-orange-100"
                        data-testid={`button-edit-${log.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(log.id)}
                        disabled={deleteTimeLogMutation.isPending}
                        className="text-red-600 hover:bg-red-100"
                        data-testid={`button-delete-${log.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredTimeLogs.length > 20 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                      View All {activeTab} Time Logs ({filteredTimeLogs.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Time Log Dialog */}
        {editingLog && (
          <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Time Log</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter description..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingLog(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEdit}
                    disabled={updateTimeLogMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {updateTimeLogMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}