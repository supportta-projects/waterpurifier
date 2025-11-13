import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-lg hover:brightness-[1.05]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-opacity-90 hover:text-primary",
        outline:
          "border border-primary/50 text-primary bg-transparent hover:bg-primary/10",
        ghost: "text-primary hover:bg-primary/10",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        subtle:
          "bg-gradient-soft text-primary hover:ring-2 hover:ring-primary/20",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          asChild ? "rounded-full" : "",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };

