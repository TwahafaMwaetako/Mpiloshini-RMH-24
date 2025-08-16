import React, { useState, useEffect } from "react";
import { VibrationRecord, FaultDetection, Machine } from "@/entities/all";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, TrendingUp, Filter, Settings } from "lucide-react";

import AnalysisCard from "@/components/analysis/AnalysisCard";
import FaultChart from "@/components/analysis/FaultChart";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function Analysis() {
  const [records, setRecords] = useState<(VibrationRecord & { machine_id: string })[]>([]);
  const [detections, setDetections] = useState<FaultDetection[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch analysis data from your backend API
    setLoading(false);
  }, []);

  const filteredRecords = selectedMachine === 'all'
    ? records
    : records.filter(record => record.machine_id === selectedMachine);
  
  const filteredDetections = detections.filter(detection => 
    filteredRecords.some(record => record.id === detection.record_id)
  );

  const filteredMachines = selectedMachine === 'all'
    ? machines
    : machines.filter(machine => machine.id === selectedMachine);

  const avgHealthScore = filteredMachines.length > 0
    ? Math.round(filteredMachines.reduce((acc, m) => acc + m.health_score, 0) / filteredMachines.length)
    : 0;

  const processedRecordsCount = filteredRecords.filter(r => r.processed).length;
  const faultCount = filteredDetections.length;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8">
        <div className="rounded-2xl bg-soft-light-gray p-8 shadow-neumorphic-extrude">
          <div className="flex animate-pulse flex-col items-center gap-4">
            <div className="rounded-full bg-soft-light-gray p-4 shadow-neumorphic-inset">
              <Activity className="h-8 w-8 text-accent-subtle" />
            </div>
            <p className="font-medium text-text-body">Loading analysis data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark-gray">Vibration Analysis</h1>
          <p className="mt-1 text-text-body">Review fault detection results and machine health trends</p>
        </div>
        <Select value={selectedMachine} onValueChange={setSelectedMachine}>
          <SelectTrigger className="w-full rounded-lg border-none bg-soft-light-gray p-3 text-text-dark-gray shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-accent-subtle md:w-56">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Machines</SelectItem>
            {machines.map((machine) => (
              <SelectItem key={machine.id} value={machine.id}>
                {machine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <NeumorphicCard>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-body">Processed Records</h3>
            <div className="rounded-lg bg-soft-light-gray p-2 shadow-neumorphic-inset">
              <Activity className="h-5 w-5 text-accent-subtle" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-semibold text-text-dark-gray">{processedRecordsCount}/{filteredRecords.length}</p>
        </NeumorphicCard>
        <NeumorphicCard>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-body">Active Faults</h3>
            <div className="rounded-lg bg-soft-light-gray p-2 shadow-neumorphic-inset">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-semibold text-text-dark-gray">{faultCount}</p>
        </NeumorphicCard>
        <NeumorphicCard>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-body">Avg Health Score</h3>
            <div className="rounded-lg bg-soft-light-gray p-2 shadow-neumorphic-inset">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-semibold text-text-dark-gray">{avgHealthScore}%</p>
        </NeumorphicCard>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <NeumorphicCard className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-text-dark-gray">Recent Analysis</h2>
            <div className="space-y-3">
              {filteredRecords.slice(0, 10).map((record) => (
                <AnalysisCard
                  key={record.id}
                  record={record}
                  machines={machines}
                  detections={detections.filter(d => d.record_id === record.id)}
                />
              ))}
            </div>
          </NeumorphicCard>
          <NeumorphicCard className="lg:col-span-3">
            <h2 className="mb-4 text-xl font-semibold text-text-dark-gray">Fault Distribution</h2>
            <FaultChart detections={filteredDetections} />
          </NeumorphicCard>
        </div>
      ) : (
        <NeumorphicCard className="p-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-neumorphic-inset">
            <Settings className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-text-dark-gray">No Data for Selected Machine</h3>
          <p className="text-text-body">Upload vibration data for this machine to see analysis results.</p>
        </NeumorphicCard>
      )}
    </div>
  );
}