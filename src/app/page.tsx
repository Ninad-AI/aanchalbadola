"use client";

import { useState } from "react";
import IdleHero from "@/components/IdleHero";
import AuthModal from "@/components/AuthModal";
import ActiveChat from "@/components/ActiveChat";

type FlowState = "idle" | "auth" | "active";

export default function Home() {
  const [flow, setFlow] = useState<FlowState>("idle");

  return (
    <main className="relative h-[100dvh] overflow-hidden">
      {/* Idle View */}
      {flow === "idle" && (
        <IdleHero onStartSession={() => setFlow("auth")} />
      )}

      {/* Auth Modal (overlays on idle) */}
      {flow === "auth" && (
        <>
          <IdleHero onStartSession={() => { }} />
          <AuthModal
            onSuccess={() => setFlow("active")}
            onClose={() => setFlow("idle")}
          />
        </>
      )}

      {/* Active Chat */}
      {flow === "active" && (
        <ActiveChat onSessionEnd={() => setFlow("idle")} />
      )}
    </main>
  );
}
