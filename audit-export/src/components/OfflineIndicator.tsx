import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
      setShowReconnected(true);
      
      // Hide reconnected message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showOffline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      {showOffline && (
        <Alert variant="destructive" className="shadow-lg animate-in slide-in-from-top">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="font-medium">
            You're offline. Changes will sync when you reconnect.
          </AlertDescription>
        </Alert>
      )}
      
      {showReconnected && (
        <Alert className="bg-green-50 text-green-900 border-green-200 shadow-lg animate-in slide-in-from-top">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="font-medium text-green-900">
            Back online! Your connection has been restored.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
