import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PanelRightOpen, PanelRightClose, X } from "lucide-react";

interface SplitLayoutProps {
  children: ReactNode;
  rightPanel: ReactNode;
  rightPanelTitle?: string;
  rightPanelWidth?: "sm" | "md" | "lg";
  defaultOpen?: boolean;
  persistKey?: string;
  mobileBreakpoint?: number;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

export function SplitLayout({
  children,
  rightPanel,
  rightPanelTitle = "Details",
  rightPanelWidth = "md",
  defaultOpen = true,
  persistKey,
  mobileBreakpoint = 1024,
  className,
  leftClassName,
  rightClassName,
}: SplitLayoutProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (persistKey) {
      const stored = localStorage.getItem(`split-layout-${persistKey}`);
      if (stored !== null) {
        setIsOpen(stored === "true");
      }
    }
  }, [persistKey]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mobileBreakpoint]);

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (persistKey) {
      localStorage.setItem(`split-layout-${persistKey}`, String(newState));
    }
  };

  const widthClasses = {
    sm: "w-80",
    md: "w-96",
    lg: "w-[28rem]",
  };

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        <div className="fixed bottom-4 right-4 z-50">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-lg"
                data-testid="button-open-panel-mobile"
              >
                <PanelRightOpen className="h-5 w-5 mr-2" />
                {rightPanelTitle}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{rightPanelTitle}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSheetOpen(false)}
                  data-testid="button-close-panel-mobile"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-auto h-full pb-8">
                {rightPanel}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", className)}>
      <div
        className={cn(
          "flex-1 overflow-auto transition-all duration-200",
          isOpen ? "pr-4" : "",
          leftClassName
        )}
      >
        {children}
      </div>

      {isOpen ? (
        <div
          className={cn(
            "flex-shrink-0 border-l bg-muted/30 overflow-auto transition-all duration-200",
            widthClasses[rightPanelWidth],
            rightClassName
          )}
        >
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
            <div className="flex items-center justify-between p-3">
              <h2 className="font-semibold text-sm">{rightPanelTitle}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleOpen}
                data-testid="button-collapse-panel"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            {rightPanel}
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 border-l p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleOpen}
            className="w-full"
            data-testid="button-expand-panel"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default SplitLayout;
