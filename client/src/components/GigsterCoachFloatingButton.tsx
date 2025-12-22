import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Lightbulb, Send, FileText, CheckSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function GigsterCoachFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const hiddenRoutes = [
    '/login', '/signup', '/landing', '/mobile', '/quick-start', 
    '/gigster-coach', '/gigster-coach/suggestions'
  ];
  const shouldHide = hiddenRoutes.some(route => location.startsWith(route)) || !isAuthenticated;

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {isOpen && (
        <div className="mb-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              GigsterCoach
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Your AI business coach for questions, drafts, and reviews.
          </p>
          <div className="space-y-2">
            <Link href="/gigster-coach">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setIsOpen(false)} data-testid="link-coach-ask">
                <MessageCircle className="h-4 w-4" />
                Ask a Question
              </Button>
            </Link>
            <Link href="/gigster-coach">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setIsOpen(false)} data-testid="link-coach-draft">
                <FileText className="h-4 w-4" />
                Draft Content
              </Button>
            </Link>
            <Link href="/gigster-coach">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setIsOpen(false)} data-testid="link-coach-review">
                <CheckSquare className="h-4 w-4" />
                Review My Work
              </Button>
            </Link>
            <Link href="/gigster-coach/suggestions">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => setIsOpen(false)} data-testid="link-coach-suggestions">
                <Send className="h-4 w-4" />
                View Suggestions
              </Button>
            </Link>
          </div>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-[#004C6D] to-[#0B1D3A] hover:from-[#003d57] hover:to-[#0a1730] text-white"
        data-testid="button-floating-coach"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Lightbulb className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
