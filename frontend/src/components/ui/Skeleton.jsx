import { cn } from "../../utils/cn";

export function Skeleton({ className, style }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block rounded-md bg-[linear-gradient(90deg,#eceef2_25%,#f5f6f8_37%,#eceef2_63%)] bg-[length:200%_100%]",
        "animate-[sp-shimmer_1.4s_ease_infinite]",
        className,
      )}
      style={style}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: `${90 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
