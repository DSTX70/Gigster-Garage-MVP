export function getAriaLabel(action: string, target?: string): string {
  if (target) {
    return `${action} ${target}`;
  }
  return action;
}

export function getButtonAriaLabel(
  iconName: string,
  context?: string
): string {
  const labels: Record<string, string> = {
    Plus: "Add",
    Minus: "Remove",
    X: "Close",
    Check: "Confirm",
    Edit: "Edit",
    Trash: "Delete",
    Copy: "Copy",
    Download: "Download",
    Upload: "Upload",
    Search: "Search",
    Filter: "Filter",
    Sort: "Sort",
    Refresh: "Refresh",
    Settings: "Settings",
    Menu: "Open menu",
    MoreVertical: "More options",
    MoreHorizontal: "More options",
    ChevronLeft: "Previous",
    ChevronRight: "Next",
    ChevronUp: "Expand",
    ChevronDown: "Collapse",
    Eye: "View",
    EyeOff: "Hide",
    Lock: "Locked",
    Unlock: "Unlocked",
    Star: "Favorite",
    Heart: "Like",
    Send: "Send",
    Save: "Save",
    Share: "Share",
    Link: "Copy link",
    ExternalLink: "Open in new tab",
    Maximize: "Maximize",
    Minimize: "Minimize",
    Play: "Play",
    Pause: "Pause",
    Stop: "Stop",
  };

  const baseLabel = labels[iconName] || iconName;
  return context ? `${baseLabel} ${context}` : baseLabel;
}

export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeydown);
  firstFocusable?.focus();

  return () => {
    container.removeEventListener("keydown", handleKeydown);
  };
}

export function handleEscapeKey(onEscape: () => void): () => void {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onEscape();
    }
  };

  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}

export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function meetsWCAGAA(contrastRatio: number, isLargeText = false): boolean {
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

export function meetsWCAGAAA(contrastRatio: number, isLargeText = false): boolean {
  return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

export const skipLinkStyles = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--background);
    color: var(--foreground);
    padding: 8px 16px;
    z-index: 100;
    transition: top 0.2s;
  }
  .skip-link:focus {
    top: 0;
  }
`;

export function createSkipLink(targetId: string, text = "Skip to main content"): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = `#${targetId}`;
  link.className = "skip-link sr-only focus:not-sr-only";
  link.textContent = text;
  return link;
}

export default {
  getAriaLabel,
  getButtonAriaLabel,
  announceToScreenReader,
  trapFocus,
  handleEscapeKey,
  isReducedMotion,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  createSkipLink,
};
