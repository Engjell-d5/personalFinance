import { RouterProvider } from "react-router";
import { router } from "./router";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { seedDatabase } from "@/db/seed";
import { processRecurringRules } from "@/services/recurring-processor";
import { sync } from "@/services/sync-engine";
import { isSignedIn } from "@/services/google-auth";
import { LockScreen } from "@/components/auth/LockScreen";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const isFirstTime = !localStorage.getItem("pf-app-pin");

  useEffect(() => {
    if (unlocked) {
      seedDatabase().then(() => processRecurringRules());
    }
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && isSignedIn()) {
        sync();
      }
    }

    function handleOnline() {
      if (isSignedIn()) {
        sync();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [unlocked]);

  if (!unlocked) {
    return (
      <ThemeProvider>
        <LockScreen
          isFirstTime={isFirstTime}
          onUnlock={() => setUnlocked(true)}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
