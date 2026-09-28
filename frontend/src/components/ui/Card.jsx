import { cn } from "../../utils/cn";

export function Card({ as: Comp = "section", className, children, ...props }) {
  return (
    <Comp className={cn("card", className)} {...props}>
      {children}
    </Comp>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="size-[18px]" />
          </span>
        ) : null}
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
