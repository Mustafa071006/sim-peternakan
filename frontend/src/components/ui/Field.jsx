import { forwardRef, useId } from "react";
import { AlertCircle, ChevronDown, Info } from "lucide-react";

import { cn } from "../../utils/cn";

function Shell({ id, label, required, hint, error, children, className }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="text-[13px] font-semibold text-ink"
        >
          {label}
          {required ? <span className="text-rose-ink"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="flex items-center gap-1 text-xs font-medium text-down">
          <AlertCircle className="size-3.5" />
          {error}
        </span>
      ) : hint ? (
        <span className="flex items-center gap-1 text-xs text-muted">
          <Info className="size-3.5 shrink-0" />
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export const TextField = forwardRef(function TextField(
  { label, required, hint, error, suffix, prefix, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Shell
      id={fieldId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-xl border bg-surface transition-[border-color,box-shadow] duration-150 focus-within:border-brand-400 focus-within:ring-[3px] focus-within:ring-brand-100",
          error ? "border-down/60" : "border-line-strong hover:border-[#cfd5de]",
        )}
      >
        {prefix ? (
          <span className="grid place-items-center border-r border-line bg-canvas px-3 text-[13px] font-medium text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          id={fieldId}
          className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-faint disabled:cursor-not-allowed disabled:text-muted read-only:text-muted"
          {...props}
        />
        {suffix ? (
          <span className="grid place-items-center border-l border-line bg-canvas px-3 text-[13px] font-medium text-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </Shell>
  );
});

export const SelectField = forwardRef(function SelectField(
  { label, required, hint, error, children, className, id, placeholder, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Shell
      id={fieldId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          className={cn(
            "w-full appearance-none rounded-xl border bg-surface px-3.5 py-2.5 pr-10 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-canvas",
            error ? "border-down/60" : "border-line-strong hover:border-[#cfd5de]",
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
      </div>
    </Shell>
  );
});

export const TextareaField = forwardRef(function TextareaField(
  { label, required, hint, error, className, id, rows = 3, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Shell
      id={fieldId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100",
          error ? "border-down/60" : "border-line-strong hover:border-[#cfd5de]",
        )}
        {...props}
      />
    </Shell>
  );
});
