import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User as UserIcon, Briefcase, DollarSign, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { TimeLog, Project, User, Task } from "@shared/schema";

// Extended TimeLog with relations
interface TimeLogWithRelations extends TimeLog {
  user?: User;
  task?: Task;
  project?: Project;
}

interface TimeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (selectedLogs: TimeLog[], hourlyRate: number) => void;
  projectId?: string;
}

export function TimeImportDialog({ open, onOpenChange, onImport, projectId }: TimeImportDialogProps) {
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [filterProject, setFilterProject] = useState<string>(projectId || "all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Fetch projects for filter
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Build query params
  const queryParams = new URLSearchParams();
  if (filterProject && filterProject !== "all") {
    queryParams.append("projectId", filterProject);
  }
  if (filterStartDate) {
    queryParams.append("startDate", filterStartDate);
  }
  if (filterEndDate) {
    queryParams.append("endDate", filterEndDate);
  }

  // Fetch uninvoiced time logs
  const { data: uninvoicedLogs = [], isLoading } = useQuery<TimeLogWithRelations[]>({
    queryKey: ["/api/timelogs/uninvoiced", queryParams.toString()],
    queryFn: () => apiRequest("GET", `/api/timelogs/uninvoiced?${queryParams.toString()}`),
    enabled: open,
  });

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedLogs(new Set());
    }
  }, [open]);

  const toggleLog = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  const toggleAll = () => {
    if (selectedLogs.size === uninvoicedLogs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(uninvoicedLogs.map(log => log.id)));
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatHours = (seconds: number): number => {
    return Math.round((seconds / 3600) * 100) / 100;
  };

  const calculateTotals = () => {
    const selectedLogsArray = uninvoicedLogs.filter(log => selectedLogs.has(log.id));
    const totalSeconds = selectedLogsArray.reduce((sum, log) => sum + (parseInt(log.duration || "0", 10)), 0);
    const totalHours = totalSeconds / 3600;
    const totalAmount = totalHours * hourlyRate;
    return { totalHours: Math.round(totalHours * 100) / 100, totalAmount: Math.round(totalAmount * 100) / 100 };
  };

  const handleImport = () => {
    const selectedLogsArray = uninvoicedLogs.filter(log => selectedLogs.has(log.id));
    onImport(selectedLogsArray, hourlyRate);
    onOpenChange(false);
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="dialog-time-import">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Import Time from Timesheet
          </DialogTitle>
          <DialogDescription>
            Select approved time entries to add to this invoice. Set your hourly rate and review the total before importing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-filter">Project</Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger id="project-filter" data-testid="select-project-filter">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourly-rate" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Hourly Rate
            </Label>
            <Input
              id="hourly-rate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              placeholder="75.00"
              data-testid="input-hourly-rate"
            />
          </div>

          <Separator />

          {/* Time Logs List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Available Time Entries ({uninvoicedLogs.length})</Label>
              {uninvoicedLogs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                  data-testid="button-toggle-all"
                >
                  {selectedLogs.size === uninvoicedLogs.length ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading time entries...</div>
              ) : uninvoicedLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved time entries available for invoicing
                </div>
              ) : (
                <div className="space-y-3">
                  {uninvoicedLogs.map((log) => {
                    const hours = formatHours(parseInt(log.duration || "0", 10));
                    const amount = hours * hourlyRate;
                    
                    return (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          selectedLogs.has(log.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                        }`}
                        data-testid={`time-log-${log.id}`}
                      >
                        <Checkbox
                          checked={selectedLogs.has(log.id)}
                          onCheckedChange={() => toggleLog(log.id)}
                          className="mt-1"
                          data-testid={`checkbox-time-log-${log.id}`}
                        />
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm">{log.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {log.project && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {log.project.name}
                              </span>
                            )}
                            {log.task && (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {log.task.title}
                              </span>
                            )}
                            {log.user && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {log.user.name || log.user.username}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(log.startTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {formatDuration(parseInt(log.duration || "0", 10))}
                          </Badge>
                          <p className="text-sm font-medium">${amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{hours} hrs × ${hourlyRate}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Preview Summary */}
          {selectedLogs.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-900">Import Preview</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">Selected Entries</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedLogs.size}</p>
                </div>
                <div>
                  <p className="text-blue-700">Total Hours</p>
                  <p className="text-2xl font-bold text-blue-900">{totals.totalHours}</p>
                </div>
                <div>
                  <p className="text-blue-700">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-900">${totals.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedLogs.size === 0}
            data-testid="button-import"
          >
            <Clock className="w-4 h-4 mr-2" />
            Import {selectedLogs.size} {selectedLogs.size === 1 ? "Entry" : "Entries"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
