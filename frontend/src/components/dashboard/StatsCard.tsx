import NeumorphicCard from "@/components/NeumorphicCard";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
}) => {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <NeumorphicCard className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-body">{title}</p>
        <div className="rounded-lg bg-soft-light-gray p-2 shadow-neumorphic-inset">
          <Icon className="h-5 w-5 text-accent-subtle" />
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-2xl font-semibold text-text-dark-gray">{value}</h3>
        {trend && trendValue && (
          <div className="mt-1 flex items-center text-xs">
            <TrendIcon className={cn("mr-1 h-4 w-4", trendColor)} />
            <span className={cn("font-medium", trendColor)}>{trendValue}</span>
            <span className="ml-1 text-text-body">from last week</span>
          </div>
        )}
      </div>
    </NeumorphicCard>
  );
};

export default StatsCard;