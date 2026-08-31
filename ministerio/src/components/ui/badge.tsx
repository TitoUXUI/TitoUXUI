import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "destructive" | "outline";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
