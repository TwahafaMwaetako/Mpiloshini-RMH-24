import { Machine } from "@/entities/all";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import React from "react";

interface MachineStatusCardProps {
  machine: Machine;
}

const MachineStatusCard: React.FC<MachineStatusCardProps> = ({ machine }) => {
  const getHealthColor = (score: number) => {
    if (score > 90) return "bg-green-500";
    if (score > 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-xl bg-soft-light-gray p-4 shadow-neumorphic-inset">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-soft-light-gray p-2 shadow-neumorphic-extrude">
            <Settings className="h-6 w-6 text-accent-subtle" />
          </div>
          <div>
            <h3 className="font-semibold text-text-dark-gray">{machine.name}</h3>
            <p className="text-xs capitalize text-text-body">{machine.type}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium text-white",
            machine.status === "active" ? "bg-green-500" : "bg-gray-400"
          )}
        >
          {machine.status}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-body">Health Score</span>
          <span className="font-semibold text-text-dark-gray">
            {machine.health_score}%
          </span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-soft-light-gray shadow-neumorphic-inset">
          <div
            className={cn(
              "h-full rounded-full",
              getHealthColor(machine.health_score)
            )}
            style={{ width: `${machine.health_score}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MachineStatusCard;