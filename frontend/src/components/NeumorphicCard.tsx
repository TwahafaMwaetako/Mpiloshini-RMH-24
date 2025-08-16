import { cn } from "@/lib/utils";
import React from "react";

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const NeumorphicCard = React.forwardRef<HTMLDivElement, NeumorphicCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-soft-light-gray p-6 shadow-neumorphic-extrude transition-shadow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeumorphicCard.displayName = "NeumorphicCard";

export default NeumorphicCard;