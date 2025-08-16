import NeumorphicCard from "@/components/NeumorphicCard";
import React from "react";

interface ReportCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
}) => {
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
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </NeumorphicCard>
  );
};

export default ReportCard;