import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  outline: "border border-border bg-transparent hover:bg-secondary",
  ghost: "bg-transparent hover:bg-secondary",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function ButtonLink({ className, variant = "primary", size = "md", ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variantClasses[variant], sizeClasses[size], className)} {...props} />;
}
