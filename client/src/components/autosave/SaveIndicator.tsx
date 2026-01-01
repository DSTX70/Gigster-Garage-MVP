import { useState, useEffect, useCallback, useRef } from "react";
import { Cloud, CloudOff, Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  errorMessage?: string;
  className?: string;
  showTimestamp?: boolean;
}

export function SaveIndicator({
  status,
  lastSaved,
  errorMessage,
  className,
  showTimestamp = true,
}: SaveIndicatorProps) {
  const [displayTime, setDisplayTime] = useState<string>("");

  useEffect(() => {
    if (!lastSaved || !showTimestamp) return;

    const updateTime = () => {
      setDisplayTime(formatDistanceToNow(lastSaved, { addSuffix: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [lastSaved, showTimestamp]);

  const statusConfig = {
    idle: {
      icon: Cloud,
      text: "Ready",
      className: "text-muted-foreground",
    },
    saving: {
      icon: Loader2,
      text: "Saving...",
      className: "text-blue-500",
      animate: true,
    },
    saved: {
      icon: Check,
      text: showTimestamp && displayTime ? `Saved ${displayTime}` : "Saved",
      className: "text-green-500",
    },
    error: {
      icon: AlertTriangle,
      text: errorMessage || "Save failed",
      className: "text-red-500",
    },
    offline: {
      icon: CloudOff,
      text: "Offline - changes saved locally",
      className: "text-yellow-500",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors",
        config.className,
        className
      )}
      role="status"
      aria-live="polite"
      data-testid="save-indicator"
    >
      <Icon
        className={cn("h-3.5 w-3.5", config.animate && "animate-spin")}
      />
      <span>{config.text}</span>
    </div>
  );
}

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
  storageKey?: string;
}

interface UseAutosaveResult<T> {
  status: SaveStatus;
  lastSaved: Date | null;
  errorMessage: string | null;
  saveNow: () => void;
  hasDraft: boolean;
  loadDraft: () => T | null;
  clearDraft: () => void;
}

export function useAutosave<T>({
  data,
  onSave,
  debounceMs = 3000,
  enabled = true,
  storageKey,
}: UseAutosaveOptions<T>): UseAutosaveResult<T> {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef(data);
  const isOnlineRef = useRef(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (storageKey) {
      const draft = localStorage.getItem(`draft-${storageKey}`);
      setHasDraft(!!draft);
    }
  }, [storageKey]);

  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      if (status === "offline") {
        setStatus("idle");
      }
    };
    const handleOffline = () => {
      isOnlineRef.current = false;
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [status]);

  const performSave = useCallback(async () => {
    if (!enabled) return;

    if (!isOnlineRef.current) {
      if (storageKey) {
        localStorage.setItem(`draft-${storageKey}`, JSON.stringify(dataRef.current));
        setHasDraft(true);
      }
      setStatus("offline");
      return;
    }

    setStatus("saving");
    setErrorMessage(null);

    try {
      await onSave(dataRef.current);
      setLastSaved(new Date());
      setStatus("saved");
      
      if (storageKey) {
        localStorage.removeItem(`draft-${storageKey}`);
        setHasDraft(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      setErrorMessage(message);
      setStatus("error");
      
      if (storageKey) {
        localStorage.setItem(`draft-${storageKey}`, JSON.stringify(dataRef.current));
        setHasDraft(true);
      }
    }
  }, [enabled, onSave, storageKey]);

  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled, performSave]);

  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave();
  }, [performSave]);

  const loadDraft = useCallback((): T | null => {
    if (storageKey) {
      const draft = localStorage.getItem(`draft-${storageKey}`);
      if (draft) {
        try {
          return JSON.parse(draft) as T;
        } catch {
          return null;
        }
      }
    }
    return null;
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(`draft-${storageKey}`);
      setHasDraft(false);
    }
  }, [storageKey]);

  return {
    status,
    lastSaved,
    errorMessage,
    saveNow,
    hasDraft,
    loadDraft,
    clearDraft,
  };
}

export default SaveIndicator;
