import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        primary: "bg-forest text-cream hover:bg-forest-700 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]",
        lime: "bg-lime text-forest hover:bg-lime-300",
        outline: "border border-forest/20 text-forest hover:bg-forest/5",
        ghost: "text-forest hover:bg-forest/6",
        light: "bg-cream text-forest hover:bg-white",
        glass: "bg-white/12 text-cream backdrop-blur-md border border-white/20 hover:bg-white/20",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-14 px-7 text-base",
        xl: "h-16 px-8 text-lg",
        icon: "size-11",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
