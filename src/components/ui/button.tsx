import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-[background-color,color,border-color,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-purple-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] disabled:active:scale-100 select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-purple-600 text-onyx-100 hover:bg-purple-700 active:bg-purple-800",
        secondary: "bg-onyx-200 text-onyx-700 hover:bg-onyx-300 hover:text-onyx-800 active:bg-onyx-400",
        outline: "bg-transparent text-onyx-700 shadow-[inset_0_0_0_1px_hsl(var(--onyx-300))] hover:bg-onyx-200 hover:shadow-[inset_0_0_0_1px_hsl(var(--onyx-400))] hover:text-onyx-800 active:bg-onyx-300",
        ghost: "bg-transparent text-purple-600 hover:bg-purple-100 hover:text-purple-700 active:bg-purple-200",
        destructive: "bg-cerise-600 text-onyx-100 hover:bg-cerise-700 active:bg-cerise-800",
        success: "bg-green-600 text-onyx-100 hover:bg-green-700 active:bg-green-800",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-md [&_svg]:size-3.5",
        sm: "h-10 px-4 text-[13px] rounded-lg [&_svg]:size-4",
        default: "h-12 px-6 text-sm rounded-[10px] [&_svg]:size-[18px]",
        lg: "h-14 px-8 text-base rounded-xl [&_svg]:size-5",
        xl: "h-16 px-10 text-lg rounded-[14px] [&_svg]:size-6",
        icon: "h-12 w-12 rounded-[10px] [&_svg]:size-[18px]",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
