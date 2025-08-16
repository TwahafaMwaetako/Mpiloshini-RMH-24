import React from 'react';
import { Machine } from '@/entities/all';
import NeumorphicCard from '@/components/NeumorphicCard';
import NeumorphicButton from '@/components/NeumorphicButton';
import { Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MachineCardProps {
  machine: Machine;
  onEdit: (machine: Machine) => void;
  onDelete: (id: string) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, onEdit, onDelete }) => {
  const getHealthColor = (score: number) => {
    if (score > 90) return "bg-green-500";
    if (score > 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-dark-gray">{machine.name}</h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium text-white",
            machine.status === "active" ? "bg-green-500" : machine.status === 'maintenance' ? 'bg-yellow-500' : "bg-gray-400"
          )}
        >
          {machine.status}
        </span>
      </div>
      <p className="mt-1 text-sm capitalize text-text-body">{machine.type}</p>
      
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

      <div className="mt-6 flex justify-end gap-3">
        <NeumorphicButton onClick={() => onEdit(machine)} className="px-3 py-1.5 text-sm">
          <Settings className="h-4 w-4" />
        </NeumorphicButton>
        <NeumorphicButton onClick={() => onDelete(machine.id)} className="px-3 py-1.5 text-sm bg-red-500/10 text-red-600 hover:bg-red-500/20">
          <Trash2 className="h-4 w-4" />
        </NeumorphicButton>
      </div>
    </NeumorphicCard>
  );
};

export default MachineCard;