import React from 'react';
import { FaultDetection } from '@/entities/all';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface FaultChartProps {
  detections: FaultDetection[];
}

const FaultChart: React.FC<FaultChartProps> = ({ detections }) => {
  const faultCounts = detections.reduce((acc, detection) => {
    acc[detection.fault_type] = (acc[detection.fault_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(faultCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl shadow-neumorphic-inset">
        <p className="text-text-body">No fault data to display.</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(224, 224, 224, 0.9)',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '3px 3px 6px #bebebe, -3px -3px 6px #ffffff',
            }}
          />
          <Bar dataKey="count" fill="#5a7d9a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FaultChart;