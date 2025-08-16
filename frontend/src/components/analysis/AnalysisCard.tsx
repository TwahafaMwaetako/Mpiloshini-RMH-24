import React from 'react';
import { VibrationRecord, FaultDetection, Machine } from '@/entities/all';
import NeumorphicCard from '@/components/NeumorphicCard';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  record: VibrationRecord;
  detections: FaultDetection[];
  machines: Machine[];
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ record, detections, machines }) => {
  const machine = machines.find(m => m.id === (record as any).machine_id);

  const getSeverityColor = (score: number) => {
    if (score > 80) return 'bg-red-500/20 text-red-700';
    if (score > 60) return 'bg-orange-500/20 text-orange-700';
    return 'bg-yellow-500/20 text-yellow-700';
  };

  return (
    <NeumorphicCard className="p-4 shadow-neumorphic-inset">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text-dark-gray">{machine?.name || 'Unknown Machine'}</p>
          <p className="text-xs text-text-body">{record.file_name}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {record.processed ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Processed</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-orange-500">Processing</span>
            </>
          )}
        </div>
      </div>
      
      {detections.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-gray-300 pt-3">
          <h4 className="text-xs font-semibold uppercase text-text-body">Detected Faults</h4>
          <div className="flex flex-wrap gap-2">
            {detections.map(detection => (
              <Badge key={detection.id} className={cn("font-normal", getSeverityColor(detection.severity_score))}>
                <AlertTriangle className="mr-1.5 h-3 w-3" />
                {detection.fault_type} (Severity: {detection.severity_score})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </NeumorphicCard>
  );
};

export default AnalysisCard;