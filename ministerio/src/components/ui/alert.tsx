import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "destructive" | "warning";

const variantClasses: Record<Variant, string> = {
  default: "border-border bg-secondary text-secondary-foreground",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return (
    <div
      role="alert"
      className={cn("rounded-lg border p-3 text-sm", variantClasses[variant], className)}
      {...props}
    />
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
