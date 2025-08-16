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
  const handleChange = (field: string, value: string) => {
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
      </div>

      <div className="pt-4">
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
      </div>
    </form>
  );
};

export default MetadataForm;