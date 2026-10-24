import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "../../utils/cn";

const VARIANTS = {
  primary:
    "bg-brand-500 text-white shadow-[0_6px_16px_-6px_rgba(31,157,97,0.55)] hover:bg-brand-600 active:bg-brand-700",
  secondary:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200/70",
  outline:
    "bg-surface text-ink border border-line-strong hover:border-brand-400 hover:text-brand-700",
  ghost: "bg-transparent text-muted hover:bg-brand-50 hover:text-brand-700",
  danger: "bg-rose-ink text-white hover:brightness-95 active:brightness-90",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
};

export const Button = forwardRef(function Button(
  {
    as: Comp = "button",
    variant = "primary",
    size = "md",
    className,
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    children,
    type,
    ...props
  },
  ref,
) {
  const isButton = Comp === "button";
  return (
    <Comp
      ref={ref}
      type={isButton ? type || "button" : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition-[background,color,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 not-disabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      {children}
      {IconRight && !loading ? <IconRight className="size-4" /> : null}
    </Comp>
  );
});
