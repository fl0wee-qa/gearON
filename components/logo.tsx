import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

export function GearOnLogo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg shadow-[0_0_22px_rgba(47,98,255,0.35)]">
        <Zap className="text-primary-foreground h-4 w-4 fill-current" />
      </div>
      <span className="font-display text-xl font-extrabold tracking-tight uppercase">
        gear<span className="text-primary">ON</span>
      </span>
    </div>
  );
}
