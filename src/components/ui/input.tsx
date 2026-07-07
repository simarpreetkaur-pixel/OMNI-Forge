import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[10px] border border-onyx-400 bg-onyx-100 px-4 py-2 text-base text-onyx-800 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-onyx-400 hover:border-onyx-500 focus-visible:outline-none focus-visible:border-purple-600 focus-visible:ring-[3px] focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:bg-onyx-200 disabled:border-onyx-300 disabled:text-onyx-400",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
