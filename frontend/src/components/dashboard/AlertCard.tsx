import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";
import React from "react";
import { Alert } from "@/entities/all";

interface AlertCardProps {
  alert: Alert;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div className="flex items-start space-x-3 rounded-lg bg-soft-light-gray p-3 shadow-neumorphic-inset">
      <div className={cn("flex-shrink-0 rounded-full p-2", config.bgColor)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-dark-gray">
          {alert.machine}
        </p>
        <p className="text-sm text-text-body">{alert.message}</p>
        <p className="mt-1 text-xs text-gray-500">{alert.timestamp}</p>
      </div>
    </div>
  );
};

export default AlertCard;