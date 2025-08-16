import React, { useState, useEffect, useMemo } from "react";
import { VibrationRecord, Machine } from "@/entities/all";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Filter, Settings, Activity } from "lucide-react";

import ReportCard from "@/components/reports/ReportCard";
import ReportGenerator from "@/components/reports/ReportGenerator";
import NeumorphicButton from "@/components/NeumorphicButton";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function Reports() {
  const [records, setRecords] = useState<(VibrationRecord & { machine_id: string })[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [showGenerator, setShowGenerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch reports data from your backend API
    setLoading(false);
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const machineMatch = selectedMachine === 'all' || record.machine_id === selectedMachine;
      const daysAgo = parseInt(selectedPeriod);
      const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const recordDate = new Date(record.created_date);
      const periodMatch = recordDate >= cutoffDate;
      
      return machineMatch && periodMatch && record.processed;
    });
  }, [records, selectedMachine, selectedPeriod]);

  const generateSummaryReport = () => {
    // TODO: Implement summary report generation logic.
    // This could involve calling a backend endpoint that generates a report
    // or generating it client-side with a library.
    alert("Summary report generation not yet implemented.");
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8">
        <div className="rounded-2xl bg-soft-light-gray p-8 shadow-neumorphic-extrude">
          <div className="flex animate-pulse flex-col items-center gap-4">
            <div className="rounded-full bg-soft-light-gray p-4 shadow-neumorphic-inset">
              <FileText className="h-8 w-8 text-accent-subtle" />
            </div>
            <p className="font-medium text-text-body">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark-gray">Analysis Reports</h1>
          <p className="mt-1 text-text-body">Generate and download vibration analysis reports</p>
        </div>
        <NeumorphicButton onClick={() => setShowGenerator(true)}>
          <FileText className="mr-2 h-5 w-5" />
          Generate Report
        </NeumorphicButton>
      </div>

      <NeumorphicCard>
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-text-body" />
          <h2 className="text-lg font-semibold text-text-dark-gray">Report Filters</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select value={selectedMachine} onValueChange={setSelectedMachine}>
            <SelectTrigger className="w-full rounded-lg border-none bg-soft-light-gray p-3 text-text-dark-gray shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-accent-subtle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {machines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>{machine.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full rounded-lg border-none bg-soft-light-gray p-3 text-text-dark-gray shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-accent-subtle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <NeumorphicButton onClick={generateSummaryReport} disabled={filteredRecords.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </NeumorphicButton>
        </div>
      </NeumorphicCard>

      <NeumorphicCard>
        <h2 className="mb-6 text-xl font-semibold text-text-dark-gray">Report Preview</h2>
        {filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ReportCard title="Total Records" value={filteredRecords.length} icon={FileText} description={`${filteredRecords.length} processed`} />
            <ReportCard title="Average RMS" value={(filteredRecords.reduce((sum, r) => sum + (r.rms_value || 0), 0) / filteredRecords.length || 0).toFixed(4)} icon={Activity} description="Overall vibration level" />
            <ReportCard title="Machines Monitored" value={new Set(filteredRecords.map(r => r.machine_id)).size} icon={Settings} description="Unique machines in report" />
          </div>
        ) : (
          <div className="rounded-xl p-8 text-center shadow-neumorphic-inset">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="font-medium text-text-body">No data for the selected filters</p>
            <p className="mt-2 text-sm text-gray-500">Adjust filters or upload more data</p>
          </div>
        )}
      </NeumorphicCard>

      <ReportGenerator
        open={showGenerator}
        onClose={() => setShowGenerator(false)}
        records={filteredRecords}
        machines={machines}
      />
    </div>
  );
}