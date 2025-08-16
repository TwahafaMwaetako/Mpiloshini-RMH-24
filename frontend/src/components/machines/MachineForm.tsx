import React, { useState, useEffect } from 'react';
import { Machine } from '@/entities/all';
import NeumorphicInput from '@/components/NeumorphicInput';
import NeumorphicButton from '@/components/NeumorphicButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MachineFormProps {
  machine?: Machine | null;
  onSubmit: (data: Partial<Machine>) => void;
  onCancel: () => void;
}

const MachineForm: React.FC<MachineFormProps> = ({ machine, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance'>('active');

  useEffect(() => {
    if (machine) {
      setName(machine.name);
      setType(machine.type);
      setStatus(machine.status);
    } else {
      setName('');
      setType('');
      setStatus('active');
    }
  }, [machine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-text-dark-gray">Machine Name</label>
          <NeumorphicInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Main Compressor" required />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-text-dark-gray">Machine Type</label>
          <NeumorphicInput value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Compressor" required />
        </div>
      </div>
      <div>
        <label className="mb-2 block font-semibold text-text-dark-gray">Status</label>
        <Select value={status} onValueChange={(value: 'active' | 'inactive' | 'maintenance') => setStatus(value)}>
          <SelectTrigger className="w-full rounded-lg border-none bg-soft-light-gray p-3 text-text-dark-gray shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-accent-subtle">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-4">
        <NeumorphicButton type="button" onClick={onCancel}>
          Cancel
        </NeumorphicButton>
        <NeumorphicButton type="submit">
          {machine ? 'Update Machine' : 'Create Machine'}
        </NeumorphicButton>
      </div>
    </form>
  );
};

export default MachineForm;