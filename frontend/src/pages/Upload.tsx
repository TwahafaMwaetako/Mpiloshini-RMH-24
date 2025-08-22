import React, { useState, useEffect } from "react";
import { Machine } from "@/entities/all";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { machineAPI, uploadAPI, vibrationAPI, diagnosisAPI } from "@/services/api";

import FileUploadZone from "@/components/upload/FileUploadZone";
import UploadProgress from "@/components/upload/UploadProgress";
import MetadataForm from "@/components/upload/MetadataForm";
import NeumorphicButton from "@/components/NeumorphicButton";
import NeumorphicCard from "@/components/NeumorphicCard";
import { showSuccess, showError } from "@/utils/toast";

export default function UploadPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metadata, setMetadata] = useState({
    machine_id: '',
    sensor_position: 'Drive End',
    axis: 'Horizontal',
    sampling_rate: '12000',
  });

  useEffect(() => {
    fetchMachines();
  }, []);



  const fetchMachines = async () => {
    try {
      const data = await machineAPI.getAll();
      setMachines(data);
      
      // Auto-select first machine if none is selected
      if (data.length > 0 && !metadata.machine_id) {
        setMetadata(prev => ({ ...prev, machine_id: data[0].id }));
      }
      
      if (data.length === 0) {
        // Fallback machines if none are returned
        const fallbackMachines = [
          { id: 'fallback-1', name: 'Test Machine 1', type: 'Motor', status: 'active', health_score: 85, last_updated: new Date().toISOString() },
          { id: 'fallback-2', name: 'Test Machine 2', type: 'Pump', status: 'active', health_score: 92, last_updated: new Date().toISOString() },
          { id: 'fallback-3', name: 'Test Machine 3', type: 'Compressor', status: 'active', health_score: 78, last_updated: new Date().toISOString() }
        ];
        setMachines(fallbackMachines);
        setMetadata(prev => ({ ...prev, machine_id: fallbackMachines[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      showError('Failed to load machines, using fallback machines');
      
      // Fallback machines in case of API failure
      const fallbackMachines = [
        { id: 'fallback-1', name: 'Test Machine 1', type: 'Motor', status: 'active', health_score: 85, last_updated: new Date().toISOString() },
        { id: 'fallback-2', name: 'Test Machine 2', type: 'Pump', status: 'active', health_score: 92, last_updated: new Date().toISOString() },
        { id: 'fallback-3', name: 'Test Machine 3', type: 'Compressor', status: 'active', health_score: 78, last_updated: new Date().toISOString() }
      ];
      setMachines(fallbackMachines);
      setMetadata(prev => ({ ...prev, machine_id: fallbackMachines[0].id }));
    }
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    
    const status: any = {};
    files.forEach((_file, index) => {
      status[index] = { progress: 0, status: 'pending', error: null };
    });
    setUploadStatus(status);
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0 || !metadata.machine_id) {
      showError("Please select files and a machine.");
      return;
    }

    setIsUploading(true);

    let allSuccessful = true;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      setUploadStatus((prev: any) => ({
        ...prev,
        [i]: { ...prev[i], status: 'uploading', progress: 10 }
      }));

      try {
        // Step 1: Upload file directly to backend (which handles Supabase Storage)
        const uploadResult = await uploadAPI.uploadFile(file, {
          machine_id: metadata.machine_id,
          sensor_position: metadata.sensor_position,
          axis: metadata.axis,
          sampling_rate: metadata.sampling_rate
        });
        
        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], progress: 50 }
        }));

        // Step 2: Create a vibration record in the backend
        const recordData = {
          machine_id: metadata.machine_id,
          file_path: uploadResult.storage_path || uploadResult.file_path,
          file_url: uploadResult.file_url,
          file_name: uploadResult.file_name,
          sensor_position: metadata.sensor_position,
          axis: metadata.axis,
          sampling_rate: parseInt(metadata.sampling_rate) || 1000,
          measurement_date: new Date().toISOString(),
        };
        
        const recordResult = await uploadAPI.createVibrationRecord(recordData);
        
        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], progress: 80, record_id: recordResult.record_id }
        }));

        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], status: 'completed', progress: 100 }
        }));

      } catch (error: any) {
        allSuccessful = false;
        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], status: 'error', error: error.message }
        }));
      }
    }
    
    setIsUploading(false);
    if (allSuccessful) {
        showSuccess("All files uploaded and processed successfully!");
    } else {
        showError("Some files failed to upload. Check the details above.");
    }
  };

  const processAnalysis = async () => {
    setIsProcessing(true);
    
    try {
      const recordIds = Object.values(uploadStatus)
        .filter((status: any) => status.record_id)
        .map((status: any) => status.record_id);
      
      if (recordIds.length === 0) {
        showError("No records found to process");
        return;
      }
      
      // Process each record
      for (const recordId of recordIds) {
        try {
          await diagnosisAPI.analyze(recordId);
        } catch (error) {
          console.error(`Analysis failed for record ${recordId}:`, error);
        }
      }
      
      showSuccess("Analysis completed! Check the dashboard for results.");
      
    } catch (error: any) {
      showError(`Analysis failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setSelectedFiles([]);
    setUploadStatus({});
    setIsProcessing(false);
    setMetadata({
      machine_id: machines.length > 0 ? machines[0].id : '',
      sensor_position: 'Drive End',
      axis: 'Horizontal',
      sampling_rate: '12000',
    });
  };

  const allCompleted = Object.values(uploadStatus).length > 0 && Object.values(uploadStatus).every((s: any) => s.status === 'completed');
  const hasErrors = Object.values(uploadStatus).some((s: any) => s.status === 'error');



  return (
    <div className="min-h-screen bg-soft-light-gray p-4 sm:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-semibold text-text-dark-gray">Upload Vibration Data</h1>
            <p className="mt-1 text-text-body">Upload vibration files for analysis and fault detection</p>
        </div>
        <Link to="/">
          <NeumorphicButton>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </NeumorphicButton>
        </Link>
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <NeumorphicCard>
          <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold text-text-dark-gray">
            <Upload className="h-6 w-6" />
            File Upload
          </h2>
          
          {selectedFiles.length === 0 ? (
            <FileUploadZone onFileSelect={handleFileSelect} />
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl p-4 shadow-neumorphic-inset">
                <h3 className="mb-3 font-semibold text-text-dark-gray">Selected Files</h3>
                <UploadProgress files={selectedFiles} uploadStatus={uploadStatus} />
              </div>
              
              {allCompleted && (
                <div className="space-y-4">
                  <div className="rounded-xl p-4 text-center shadow-neumorphic-inset">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <p className="font-medium text-green-600">All files uploaded successfully!</p>
                  </div>
                  
                  <NeumorphicButton
                    onClick={processAnalysis}
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing Analysis...' : 'Process & Analyze Files'}
                  </NeumorphicButton>
                </div>
              )}
              
              {hasErrors && !isUploading && (
                <div className="rounded-xl p-4 text-center shadow-neumorphic-inset">
                  <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
                  <p className="font-medium text-red-600">Some files failed to upload</p>
                </div>
              )}
              
              <NeumorphicButton
                onClick={resetUpload}
                className="w-full"
              >
                Upload New Files
              </NeumorphicButton>
            </div>
          )}
        </NeumorphicCard>

        <NeumorphicCard>
          <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold text-text-dark-gray">
            <FileText className="h-6 w-6" />
            Measurement Details
          </h2>
          
          <MetadataForm
            machines={machines}
            metadata={metadata}
            onChange={setMetadata}
            onSubmit={processFiles}
            isUploading={isUploading}
            hasFiles={selectedFiles.length > 0}
            disabled={allCompleted}
          />
        </NeumorphicCard>
      </main>
    </div>
  );
}