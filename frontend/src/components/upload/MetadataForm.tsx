import React from 'react';
import { Machine } from '@/entities/all';
import NeumorphicInput from '@/components/NeumorphicInput';
import NeumorphicButton from '@/components/NeumorphicButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface MetadataFormProps {
  machines: Machine[];
  metadata: {
    machine_id: string;
    sensor_position: string;
    axis: string;
    sampling_rate: string;
  };
  onChange: (metadata: any) => void;
  onSubmit: () => void;
  isUploading: boolean;
  hasFiles: boolean;
  disabled: boolean;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  machines,
  metadata,
  onChange,
  onSubmit,
  isUploading,
  hasFiles,
  disabled,
}) => {
  // Debug logging
  console.log('MetadataForm state:', { 
    machines: machines.length, 
    metadata, 
    hasFiles, 
    isUploading, 
    disabled,
    buttonDisabled: !hasFiles || isUploading || disabled || !metadata.machine_id
  });

  const handleChange = (field: string, value: string) => {
    console.log(`MetadataForm field change: ${field} = ${value}`);
    onChange({ ...metadata, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block font-semibold text-text-dark-gray">Machine</label>
        <Select
          value={metadata.machine_id}
          onValueChange={(value) => handleChange('machine_id', value)}
          required
          disabled={disabled || isUploading}
        >
          <SelectTrigger className="w-full rounded-lg border-none bg-soft-light-gray p-3 text-text-dark-gray shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-accent-subtle">
            <SelectValue placeholder="Select a machine" />
          </SelectTrigger>
          <SelectContent>
            {machines.map((machine) => (
              <SelectItem key={machine.id} value={machine.id}>
                {machine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-text-dark-gray">Sensor Position</label>
          <NeumorphicInput
            value={metadata.sensor_position}
            onChange={(e) => handleChange('sensor_position', e.target.value)}
            placeholder="e.g., Motor Drive End"
            required
            disabled={disabled || isUploading}
          />
          {!metadata.sensor_position && (
            <button
              type="button"
              onClick={() => handleChange('sensor_position', 'Drive End')}
              className="mt-1 text-xs text-blue-500 underline"
            >
              Use "Drive End"
            </button>
          )}
        </div>
        <div>
          <label className="mb-2 block font-semibold text-text-dark-gray">Axis</label>
          <NeumorphicInput
            value={metadata.axis}
            onChange={(e) => handleChange('axis', e.target.value)}
            placeholder="e.g., Horizontal"
            required
            disabled={disabled || isUploading}
          />
          {!metadata.axis && (
            <button
              type="button"
              onClick={() => handleChange('axis', 'Horizontal')}
              className="mt-1 text-xs text-blue-500 underline"
            >
              Use "Horizontal"
            </button>
          )}
        </div>
      </div>
      
      <div>
        <label className="mb-2 block font-semibold text-text-dark-gray">Sampling Rate (Hz)</label>
        <NeumorphicInput
          type="number"
          value={metadata.sampling_rate}
          onChange={(e) => handleChange('sampling_rate', e.target.value)}
          placeholder="e.g., 20000"
          required
          disabled={disabled || isUploading}
        />
        {!metadata.sampling_rate && (
          <button
            type="button"
            onClick={() => handleChange('sampling_rate', '20000')}
            className="mt-1 text-xs text-blue-500 underline"
          >
            Use "20000"
          </button>
        )}
      </div>

      <div className="pt-4 space-y-2">
        <NeumorphicButton
          type="submit"
          className="w-full px-8 py-3"
          disabled={!hasFiles || isUploading || disabled || !metadata.machine_id}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload & Process'
          )}
        </NeumorphicButton>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          Debug: hasFiles={hasFiles.toString()}, machine_id="{metadata.machine_id}", 
          machines={machines.length}, disabled={disabled.toString()}
        </div>
        
        {/* Temporary test button */}
        {!metadata.machine_id && machines.length > 0 && (
          <button
            type="button"
            onClick={() => handleChange('machine_id', machines[0].id)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded text-sm"
          >
            Quick Select First Machine (Debug)
          </button>
        )}
      </div>
    </form>
  );
};

export default MetadataForm;