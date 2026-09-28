import { clsx } from "clsx";

/**
 * Tiny className combiner. We keep Tailwind classes conflict-free by hand,
 * so a full merge library isn't needed.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
