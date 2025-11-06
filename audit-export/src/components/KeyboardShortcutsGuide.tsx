import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  Plus,
  Search,
  Play,
  Pause,
  HelpCircle,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Shortcut {
  category: string;
  shortcuts: {
    keys: string[];
    description: string;
    icon?: React.ReactNode;
  }[];
}

const shortcuts: Shortcut[] = [
  {
    category: "General",
    shortcuts: [
      {
        keys: ["Cmd", "K"],
        description: "Open command palette",
        icon: <Command className="h-4 w-4" />,
      },
      {
        keys: ["?"],
        description: "Show keyboard shortcuts",
        icon: <HelpCircle className="h-4 w-4" />,
      },
      {
        keys: ["/"],
        description: "Focus search",
        icon: <Search className="h-4 w-4" />,
      },
      {
        keys: ["Esc"],
        description: "Close modal/dialog",
        icon: <X className="h-4 w-4" />,
      },
    ],
  },
  {
    category: "Quick Actions",
    shortcuts: [
      {
        keys: ["N"],
        description: "New task",
        icon: <Plus className="h-4 w-4" />,
      },
      {
        keys: ["T"],
        description: "Toggle timer",
        icon: <Play className="h-4 w-4" />,
      },
    ],
  },
  {
    category: "Navigation",
    shortcuts: [
      {
        keys: ["↑"],
        description: "Move up in lists",
        icon: <ArrowUp className="h-4 w-4" />,
      },
      {
        keys: ["↓"],
        description: "Move down in lists",
        icon: <ArrowDown className="h-4 w-4" />,
      },
      {
        keys: ["Enter"],
        description: "Select item",
      },
    ],
  },
];

export function KeyboardShortcutsGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Open shortcuts guide with "?"
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((category, index) => (
            <div key={category.category}>
              {index > 0 && <Separator className="my-4" />}
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon && (
                        <div className="text-gray-500">{shortcut.icon}</div>
                      )}
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          {keyIndex > 0 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                          <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-sm font-medium text-muted-foreground">
                            {key === "Cmd" && navigator.platform.includes("Mac")
                              ? "⌘"
                              : key === "Cmd"
                              ? "Ctrl"
                              : key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Press{" "}
            <kbd className="px-1.5 py-0.5 bg-white rounded border text-xs">
              ?
            </kbd>{" "}
            anytime to see this guide, or{" "}
            <kbd className="px-1.5 py-0.5 bg-white rounded border text-xs">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K
            </kbd>{" "}
            to open the command palette.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
