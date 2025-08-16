import React, { useState, useEffect } from "react";
import { Machine } from "@/entities/all";
import { Plus, Settings } from "lucide-react";

import MachineCard from "@/components/machines/MachineCard";
import MachineForm from "@/components/machines/MachineForm";
import NeumorphicButton from "@/components/NeumorphicButton";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function Machines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch machines data from your backend API
    setLoading(false);
  }, []);

  const handleSubmit = (machineData: Partial<Machine>) => {
    if (editingMachine) {
      // TODO: Replace with API call to update machine
      // Example: updateMachine(editingMachine.id, machineData).then(() => {
      //   // Refetch machines or update state locally
      // });
      console.log("Updating machine:", editingMachine.id, machineData);
    } else {
      // TODO: Replace with API call to create machine
      // Example: createMachine(machineData).then(() => {
      //   // Refetch machines or update state locally
      // });
      console.log("Creating machine:", machineData);
    }
    // NOTE: You'll need to handle state updates after the API call succeeds.
    // For now, we just close the form.
    setShowForm(false);
    setEditingMachine(null);
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setShowForm(true);
  };

  const handleDelete = (machineId: string) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      // TODO: Replace with API call to delete machine
      // Example: deleteMachine(machineId).then(() => {
      //   // Refetch machines or update state locally
      // });
      console.log("Deleting machine:", machineId);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8">
        <div className="rounded-2xl bg-soft-light-gray p-8 shadow-neumorphic-extrude">
          <div className="flex animate-pulse flex-col items-center gap-4">
            <div className="rounded-full bg-soft-light-gray p-4 shadow-neumorphic-inset">
              <Settings className="h-8 w-8 text-accent-subtle" />
            </div>
            <p className="font-medium text-text-body">Loading machines...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark-gray">Machine Management</h1>
          <p className="mt-1 text-text-body">Configure and monitor your rotating machinery</p>
        </div>
        {!showForm && (
          <NeumorphicButton onClick={() => { setShowForm(true); setEditingMachine(null); }}>
            <Plus className="mr-2 h-5 w-5" />
            Add Machine
          </NeumorphicButton>
        )}
      </div>

      {showForm && (
        <NeumorphicCard>
          <h2 className="mb-6 text-xl font-semibold text-text-dark-gray">
            {editingMachine ? 'Edit Machine' : 'Add New Machine'}
          </h2>
          <MachineForm
            machine={editingMachine}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingMachine(null);
            }}
          />
        </NeumorphicCard>
      )}

      {!showForm && machines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {machines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : !showForm && (
        <NeumorphicCard className="p-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-neumorphic-inset">
            <Settings className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-text-dark-gray">No Machines Configured</h3>
          <p className="mb-6 text-text-body">Add your first machine to start vibration monitoring</p>
          <NeumorphicButton onClick={() => { setShowForm(true); setEditingMachine(null); }}>
            <Plus className="mr-2 h-5 w-5" />
            Add Your First Machine
          </NeumorphicButton>
        </NeumorphicCard>
      )}
    </div>
  );
}