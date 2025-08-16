import { cn } from "@/lib/utils";
import React from "react";

interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeumorphicInput = React.forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border-none bg-soft-light-gray p-3 text-text-dark-gray shadow-neumorphic-inset placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-subtle",
          className
        )}
        {...props}
      />
    );
  }
);

NeumorphicInput.displayName = "NeumorphicInput";

export default NeumorphicInput;