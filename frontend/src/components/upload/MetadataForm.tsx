import React from "react";
import { Machine } from "@/entities/all";
import NeumorphicInput from "@/components/NeumorphicInput";
import NeumorphicButton from "@/components/NeumorphicButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
        <label className="mb-2 block font-semibold text-text-dark-gray">
          Machine
        </label>
        <Select
          value={metadata.machine_id}
          onValueChange={(value) => handleChange("machine_id", value)}
          required
          disabled={disabled || isUploading}
        >
          <SelectTrigger className="w-full rounded-lg border-none bg-soft-light-gray p-3 text-text-dark-gray shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-accent-subtle">
            <SelectValue
              placeholder={
                machines.length === 0
                  ? "Loading machines..."
                  : "Select a machine"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {machines.map((machine) => (
              <SelectItem key={machine.id} value={machine.id}>
                {machine.name} ({machine.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {machines.length === 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Loading available machines...
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-text-dark-gray">
            Sensor Position
          </label>
          <NeumorphicInput
            value={metadata.sensor_position}
            onChange={(e) => handleChange("sensor_position", e.target.value)}
            placeholder="e.g., Drive End, Non-Drive End, Outboard"
            required
            disabled={disabled || isUploading}
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-text-dark-gray">
            Axis
          </label>
          <NeumorphicInput
            value={metadata.axis}
            onChange={(e) => handleChange("axis", e.target.value)}
            placeholder="e.g., Horizontal, Vertical, Axial"
            required
            disabled={disabled || isUploading}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-semibold text-text-dark-gray">
          Sampling Rate (Hz)
        </label>
        <NeumorphicInput
          type="number"
          value={metadata.sampling_rate}
          onChange={(e) => handleChange("sampling_rate", e.target.value)}
          placeholder="e.g., 12000, 20000, 25600"
          required
          disabled={disabled || isUploading}
          min="1"
          max="100000"
        />
        <p className="mt-1 text-xs text-gray-500">
          Common rates: 12kHz (bearing analysis), 20kHz (general), 25.6kHz (high
          frequency)
        </p>
      </div>

      <div className="pt-4">
        <NeumorphicButton
          className="w-full px-8 py-3"
          disabled={
            !hasFiles ||
            isUploading ||
            disabled ||
            !metadata.machine_id ||
            !metadata.sensor_position ||
            !metadata.axis ||
            !metadata.sampling_rate
          }
          onClick={onSubmit}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload & Process"
          )}
        </NeumorphicButton>

        {/* Helpful message when button is disabled */}
        {(!hasFiles ||
          !metadata.machine_id ||
          !metadata.sensor_position ||
          !metadata.axis ||
          !metadata.sampling_rate) && (
          <p className="mt-2 text-sm text-gray-600 text-center">
            {!hasFiles && "Please select files to upload"}
            {hasFiles && !metadata.machine_id && "Please select a machine"}
            {hasFiles &&
              metadata.machine_id &&
              (!metadata.sensor_position ||
                !metadata.axis ||
                !metadata.sampling_rate) &&
              "Please fill in all required fields"}
          </p>
        )}
      </div>
    </form>
  );
};

export default MetadataForm;
