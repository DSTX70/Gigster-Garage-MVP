import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Clock, FileText, Users, Folder, FileSignature, Play, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function QuickActionButton() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const startTimerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/timelogs/start", { description: "Working" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs/active"] });
      toast({
        title: "Timer started",
        description: "Your work session has begun",
      });
      setOpen(false);
    },
  });

  const quickActions = [
    {
      icon: <Clock className="h-4 w-4" />,
      label: "New Task",
      shortcut: "N",
      action: () => {
        navigate("/tasks");
        setOpen(false);
      },
    },
    {
      icon: <Play className="h-4 w-4" />,
      label: "Start Timer",
      shortcut: "T",
      action: () => {
        startTimerMutation.mutate();
      },
    },
    {
      icon: <Folder className="h-4 w-4" />,
      label: "New Project",
      action: () => {
        navigate("/");
        setOpen(false);
      },
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Create Invoice",
      action: () => {
        navigate("/create-invoice");
        setOpen(false);
      },
    },
    {
      icon: <FileSignature className="h-4 w-4" />,
      label: "Create Proposal",
      action: () => {
        navigate("/create-proposal");
        setOpen(false);
      },
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Add Client",
      action: () => {
        navigate("/clients");
        setOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            data-testid="quick-action-fab"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mb-2">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {quickActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={action.action}
              className="flex items-center gap-3 cursor-pointer"
              data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {action.icon}
              <span className="flex-1">{action.label}</span>
              {action.shortcut && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {action.shortcut}
                </kbd>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
