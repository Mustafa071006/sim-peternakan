import { cn } from "../../utils/cn";
import { initials } from "../../utils/format";

const TONES = [
  "bg-brand-50 text-brand-700",
  "bg-sky-soft text-sky-ink",
  "bg-amber-soft text-amber-ink",
  "bg-rose-soft text-rose-ink",
];

const SIZES = {
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-10 text-sm",
};

export function Avatar({ name, size = "md", className }) {
  const seed = (name || "?").charCodeAt(0) % TONES.length;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold",
        TONES[seed],
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
