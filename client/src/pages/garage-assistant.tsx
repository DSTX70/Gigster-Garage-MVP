import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Sparkles,
  Send,
  X,
  ChevronRight,
  MessageSquare,
  Bell,
  Calendar,
  BarChart3,
  Users,
  Wallet,
  CheckCircle2,
  ArrowLeft,
  Plus,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { format, isAfter, startOfDay, addDays } from "date-fns";
import type { User, Task, Project } from "@shared/schema";

/**
 * Garage Assistant Dashboard - Integrated Version
 * -------------------------------------------------------------
 * AI-powered assistant integrated with existing Gigster Garage system:
 *   1) Smart Nudges based on real task/project data
 *   2) AI Chat for proposal drafting and guidance
 *   3) Context-aware insights and recommendations
 * 
 * Follows established patterns:
 * - Uses AppHeader component
 * - Garage Navy branding (#004C6D)
 * - Standard page layout structure
 * - Real data from TanStack Query
 */

// ---------- Types ----------

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

// ---------- Component ----------

export default function GarageAssistant() {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Hey! I can help you draft proposals, plan your day, analyze your task pipeline, or provide growth insights. What would you like to focus on?",
    },
  ]);
  const [input, setInput] = useState("");

  // Fetch real data using existing patterns
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Calculate insights from real data
  const insights = useMemo(() => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    
    const userTasks = tasks.filter(task => task.assignedToId === user?.id);
    const overdueTasks = userTasks.filter(task => 
      !task.completed && task.dueDate && isAfter(today, new Date(task.dueDate))
    );
    const dueTodayTasks = userTasks.filter(task => 
      !task.completed && task.dueDate && 
      startOfDay(new Date(task.dueDate)).getTime() === today.getTime()
    );
    const dueTomorrowTasks = userTasks.filter(task => 
      !task.completed && task.dueDate && 
      startOfDay(new Date(task.dueDate)).getTime() === tomorrow.getTime()
    );

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedTasks = userTasks.filter(t => t.completed).length;
    const pendingTasks = userTasks.filter(t => !t.completed).length;
    
    return {
      overdueTasks,
      dueTodayTasks,
      dueTomorrowTasks,
      activeProjects,
      completedTasks,
      pendingTasks,
      totalTasks: userTasks.length,
    };
  }, [tasks, projects, user?.id]);

  // Generate smart nudges based on real data
  const smartNudges = useMemo(() => {
    const nudges = [];
    
    if (insights.overdueTasks.length > 0) {
      nudges.push({
        id: 'overdue',
        title: `${insights.overdueTasks.length} task${insights.overdueTasks.length > 1 ? 's' : ''} overdue — need help prioritizing?`,
        cta: "Review & Plan",
        action: () => alert("Opening task prioritization helper..."),
        priority: 'high'
      });
    }

    if (insights.dueTodayTasks.length > 0) {
      nudges.push({
        id: 'today',
        title: `${insights.dueTodayTasks.length} task${insights.dueTodayTasks.length > 1 ? 's' : ''} due today — want me to create your focus plan?`,
        cta: "Create Plan",
        action: () => alert("Generating today's focus plan..."),
        priority: 'medium'
      });
    }

    if (insights.activeProjects > 3) {
      nudges.push({
        id: 'projects',
        title: `You have ${insights.activeProjects} active projects. Consider consolidating for better focus?`,
        cta: "Analyze Projects",
        action: () => alert("Opening project analysis..."),
        priority: 'low'
      });
    }

    // Add growth insights nudge
    if (insights.completedTasks > 0 && insights.pendingTasks > 0) {
      const completionRate = Math.round((insights.completedTasks / insights.totalTasks) * 100);
      nudges.push({
        id: 'progress',
        title: `You're ${completionRate}% done with your tasks this week. Want to see detailed insights?`,
        cta: "View Analytics",
        action: () => alert("Opening detailed analytics..."),
        priority: 'low'
      });
    }

    return nudges.slice(0, 3); // Show max 3 nudges
  }, [insights]);

  // AI message handling
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI response based on context
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: generateContextualReply(text, insights),
        },
      ]);
    }, 600);
  };

  // Escape to close chat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && chatOpen) setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft size={16} className="mr-2" />
                Back to Tasks
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bot className="mr-3 text-[var(--garage-navy)]" size={32} />
                Garage Assistant
              </h1>
              <p className="text-gray-600 mt-1">AI-powered insights and guidance for your projects</p>
            </div>
          </div>
          <Link href="/create-proposal">
            <Button 
              className="bg-[var(--garage-navy)] text-white hover:bg-[var(--ignition-teal)]"
              data-testid="button-new-proposal"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Proposal
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Smart Nudges */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="mr-2 text-[var(--workshop-amber)]" size={20} />
                Smart Insights
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {smartNudges.map((nudge) => (
                  <NudgeCard 
                    key={nudge.id} 
                    title={nudge.title} 
                    cta={nudge.cta} 
                    action={nudge.action} 
                    priority={nudge.priority as 'high' | 'medium' | 'low'} 
                  />
                ))}
                {smartNudges.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <CheckCircle2 className="mx-auto mb-2 text-green-500" size={32} />
                    All caught up! Your tasks are well organized.
                  </div>
                )}
              </div>
            </section>

            {/* Analytics Dashboard */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 text-[var(--garage-navy)]" size={20} />
                Your Performance
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      label="Active Projects"
                      value={insights.activeProjects}
                      color="text-[var(--garage-navy)]"
                    />
                    <MetricCard
                      label="Completed Tasks"
                      value={insights.completedTasks}
                      color="text-green-600"
                    />
                    <MetricCard
                      label="Pending Tasks"
                      value={insights.pendingTasks}
                      color="text-blue-600"
                    />
                    <MetricCard
                      label="Overdue"
                      value={insights.overdueTasks.length}
                      color="text-red-600"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>

          {/* AI Assistant Sidebar */}
          <aside className="lg:col-span-4">
            <AssistantSidebar insights={insights} />
          </aside>
        </div>

        {/* Floating Chat */}
        <FloatingChat
          open={chatOpen}
          onOpen={() => setChatOpen(true)}
          onClose={() => setChatOpen(false)}
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={(t) => {
            setInput("");
            sendMessage(t);
          }}
        />
      </div>
    </div>
  );
}

// ---------- Sub Components ----------

function AssistantSidebar({ insights }: { insights: any }) {
  const quickActions = [
    { id: 1, label: "Draft Proposal", icon: FileText, href: "/create-proposal" },
    { id: 2, label: "View Analytics", icon: BarChart3, href: "/analytics" },
    { id: 3, label: "Team Collaboration", icon: Users, href: "/team-collaboration" },
    { id: 4, label: "Workflow Automation", icon: Sparkles, href: "/workflow-automation" },
  ];

  const dailyPriorities = [
    { id: 1, label: `${insights.dueTodayTasks.length} tasks due today`, icon: Calendar, urgent: insights.dueTodayTasks.length > 0 },
    { id: 2, label: `${insights.overdueTasks.length} overdue items`, icon: AlertTriangle, urgent: insights.overdueTasks.length > 0 },
    { id: 3, label: `${insights.activeProjects} active projects`, icon: FileText, urgent: false },
  ];

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-24 space-y-6"
    >
      {/* AI Assistant Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--garage-navy)] to-[var(--ignition-teal)] text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Garage Assistant</CardTitle>
              <p className="text-sm text-gray-500">Always-on guidance</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Daily Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Daily Priorities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dailyPriorities.map(({ id, label, icon: Icon, urgent }) => (
            <div
              key={id}
              className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                urgent 
                  ? 'border-red-200 bg-red-50 text-red-800' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${urgent ? 'text-red-600' : 'text-[var(--garage-navy)]'}`} />
              <span>{label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map(({ id, label, icon: Icon, href }) => (
              <Link key={id} href={href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-[var(--garage-navy)]/10"
                  data-testid={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4 text-[var(--garage-navy)]" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NudgeCard({ title, cta, action, priority }: { 
  title: string; 
  cta: string; 
  action: () => void;
  priority: 'high' | 'medium' | 'low';
}) {
  const getBorderColor = () => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-[var(--workshop-amber)]/30 bg-[var(--workshop-amber)]/5';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`rounded-lg border p-4 ${getBorderColor()}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--garage-navy)] to-[var(--ignition-teal)] text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm text-gray-800 flex-1">{title}</p>
      </div>
      <div className="flex items-center justify-between">
        <Button
          onClick={action}
          size="sm"
          className="bg-[var(--garage-navy)] text-white hover:bg-[var(--ignition-teal)]"
        >
          {cta} <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function FloatingChat({
  open,
  onOpen,
  onClose,
  messages,
  input,
  setInput,
  onSend,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  onSend: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
    }
  };

  if (!open) {
    return (
      <button
        onClick={onOpen}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--garage-navy)] to-[var(--ignition-teal)] text-white shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed right-6 bottom-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[var(--garage-navy)] to-[var(--ignition-teal)] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-medium">AI Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-[var(--garage-navy)] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1"
            />
            <Button 
              type="submit"
              size="sm"
              className="bg-[var(--garage-navy)] hover:bg-[var(--ignition-teal)]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------- Helper Functions ----------

function generateContextualReply(userText: string, insights: any): string {
  const text = userText.toLowerCase();
  
  if (text.includes('proposal') || text.includes('draft')) {
    return `I can help you create a professional proposal! Based on your current workload of ${insights.activeProjects} active projects, I'd recommend focusing on clear deliverables and realistic timelines. Would you like me to open the proposal creator?`;
  }
  
  if (text.includes('task') || text.includes('priority')) {
    return `Looking at your tasks, you have ${insights.overdueTasks.length} overdue items and ${insights.dueTodayTasks.length} due today. I suggest tackling the overdue items first. Would you like me to help you create a priority plan?`;
  }
  
  if (text.includes('insight') || text.includes('analytics')) {
    const completionRate = insights.totalTasks > 0 ? Math.round((insights.completedTasks / insights.totalTasks) * 100) : 0;
    return `Your completion rate is ${completionRate}% with ${insights.completedTasks} completed out of ${insights.totalTasks} total tasks. You're doing great! Would you like detailed analytics or suggestions for improvement?`;
  }
  
  return `I understand you're asking about "${userText}". I can help with proposal drafting, task prioritization, project insights, or growth analytics. What specific aspect would you like to explore?`;
}