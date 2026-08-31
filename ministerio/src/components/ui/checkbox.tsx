import * as React from "react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-5 w-5 shrink-0 rounded border border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";
