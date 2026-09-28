import { toast as hotToast } from "react-hot-toast";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";

import { getErrorMessage } from "../../lib/http";

const ICONS = {
  success: <CheckCircle2 className="size-5 text-brand-500" />,
  error: <XCircle className="size-5 text-rose-ink" />,
  warning: <TriangleAlert className="size-5 text-amber-ink" />,
  info: <Info className="size-5 text-sky-ink" />,
};

function base(type, message) {
  return hotToast.custom(
    (t) => (
      <div
        className={`flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-(--shadow-pop)] ${
          t.visible ? "animate-[sp-fade-up_0.18s_ease]" : "opacity-0"
        }`}
        style={{ maxWidth: 380 }}
      >
        {ICONS[type]}
        <p className="pt-0.5 text-sm text-ink">{message}</p>
      </div>
    ),
    { duration: type === "error" ? 5000 : 3200 },
  );
}

export const toast = {
  success: (m) => base("success", m),
  error: (m) => base("error", typeof m === "string" ? m : getErrorMessage(m)),
  warning: (m) => base("warning", m),
  info: (m) => base("info", m),
  dismiss: hotToast.dismiss,
};
