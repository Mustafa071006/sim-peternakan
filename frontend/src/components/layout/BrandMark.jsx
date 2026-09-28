import { Sprout } from "lucide-react";

import { cn } from "../../utils/cn";
import { APP_CONFIG } from "../../config/app";

export function BrandMark({ compact = false, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-[0_6px_16px_-6px_rgba(31,157,97,0.6)]">
        <Sprout className="size-5" />
      </span>
      {!compact ? (
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-ink">{APP_CONFIG.appName}</div>
          <div className="text-[11px] text-muted">{APP_CONFIG.organisation}</div>
        </div>
      ) : null}
    </div>
  );
}
