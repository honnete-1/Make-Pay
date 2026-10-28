import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-14 w-full rounded-2xl border border-stone-dark bg-white px-4 text-base text-ink placeholder:text-ink-soft/60 outline-none transition focus:border-forest focus:ring-4 focus:ring-forest/10 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/10",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-sm font-medium text-ink", className)} {...props} />;
}
