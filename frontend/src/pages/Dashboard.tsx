import React, { useState, useEffect } from "react";
import { Machine, FaultDetection, VibrationRecord, Alert } from "@/entities/all";
import { Activity, Settings, Zap, AlertTriangle, TrendingUp, Upload } from "lucide-react";
import { Link } from "react-router-dom";

import StatsCard from "@/components/dashboard/StatsCard";
import AlertCard from "@/components/dashboard/AlertCard";
import MachineStatusCard from "@/components/dashboard/MachineStatusCard";
import NeumorphicButton from "@/components/NeumorphicButton";

export default function Index() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [detections, setDetections] = useState<FaultDetection[]>([]);
  const [records, setRecords] = useState<VibrationRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dashboard data from your backend API
    // e.g., fetchMachines().then(setMachines);
    // e.g., fetchAlerts().then(setAlerts);
    setLoading(false);
  }, []);

  const activeMachines = machines.filter(m => m.status === 'active').length;
  const criticalAlerts = detections.filter(d => d.severity_score > 80).length;
  const totalRecords = records.length;
  const avgHealthScore = machines.length > 0 
    ? Math.round(machines.reduce((acc, m) => acc + m.health_score, 0) / machines.length) 
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft-light-gray p-8">
        <div className="rounded-2xl bg-soft-light-gray p-8 shadow-neumorphic-extrude">
          <div className="flex animate-pulse flex-col items-center gap-4">
            <div className="rounded-full bg-soft-light-gray p-4 shadow-neumorphic-inset">
              <Zap className="h-8 w-8 text-accent-subtle" />
            </div>
            <p className="font-medium text-text-body">Loading system data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-light-gray p-4 sm:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark-gray">Vibration Analysis Dashboard</h1>
          <p className="mt-1 text-text-body">Monitor rotating machinery health and detect potential faults</p>
        </div>
        <Link to="/upload">
          <NeumorphicButton>
            <Upload className="mr-2 h-4 w-4" />
            Upload Data
          </NeumorphicButton>
        </Link>
      </header>

      <main className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Machines"
            value={activeMachines}
            icon={Settings}
          />
          <StatsCard
            title="Critical Alerts"
            value={criticalAlerts}
            icon={AlertTriangle}
          />
          <StatsCard
            title="Processed Records"
            value={totalRecords}
            icon={Activity}
          />
          <StatsCard
            title="Avg Health Score"
            value={`${avgHealthScore}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Machines Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-soft-light-gray p-6 shadow-neumorphic-extrude">
              <h2 className="mb-6 text-xl font-semibold text-text-dark-gray">Machine Status</h2>
              {machines.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {machines.slice(0, 6).map((machine) => (
                    <MachineStatusCard key={machine.id} machine={machine} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-8 text-center shadow-neumorphic-inset">
                  <Settings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="font-medium text-text-body">No machines configured</p>
                  <p className="mt-2 text-sm text-gray-500">Add your first machine to start monitoring</p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="rounded-2xl bg-soft-light-gray p-6 shadow-neumorphic-extrude">
            <h2 className="mb-6 text-xl font-semibold text-text-dark-gray">Recent Alerts</h2>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              ) : (
                <div className="rounded-xl p-4 text-center shadow-neumorphic-inset">
                  <p className="text-sm text-text-body">No recent alerts</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 rounded-xl p-4 shadow-neumorphic-inset">
              <div className="text-center">
                <p className="mb-2 text-sm text-text-body">System Health</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-text-dark-gray">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-soft-light-gray p-6 shadow-neumorphic-extrude">
          <h2 className="mb-6 text-xl font-semibold text-text-dark-gray">Recent Vibration Analysis</h2>
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.slice(0, 5).map((record) => (
                <div key={record.id} className="rounded-xl p-4 shadow-neumorphic-inset">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-text-dark-gray">{record.file_name}</h4>
                      <p className="text-sm text-text-body">
                        {record.sensor_position} • {record.axis}-axis • {record.sampling_rate} Hz
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${record.processed ? 'text-green-600' : 'text-orange-500'}`}>
                        {record.processed ? 'Processed' : 'Processing...'}
                      </p>
                      {record.rms_value && (
                        <p className="text-sm text-gray-600">RMS: {record.rms_value.toFixed(3)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-8 text-center shadow-neumorphic-inset">
              <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="font-medium text-text-body">No vibration data recorded</p>
              <p className="mt-2 text-sm text-gray-500">Upload your first vibration file to begin analysis</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}