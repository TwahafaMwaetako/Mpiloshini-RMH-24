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
    sensor_position: '',
    axis: '',
    sampling_rate: '',
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  // Add debugging for machines loading
  useEffect(() => {
    console.log('Machines state updated:', machines);
  }, [machines]);

  const fetchMachines = async () => {
    try {
      console.log('Fetching machines...');
      const data = await machineAPI.getAll();
      console.log('Machines fetched:', data);
      setMachines(data);
      
      if (data.length === 0) {
        console.warn('No machines found, using fallback');
        // Fallback machines if none are returned
        setMachines([
          { id: 'fallback-1', name: 'Test Machine 1', type: 'Motor', status: 'active', health_score: 85, last_updated: new Date().toISOString() },
          { id: 'fallback-2', name: 'Test Machine 2', type: 'Pump', status: 'active', health_score: 92, last_updated: new Date().toISOString() },
          { id: 'fallback-3', name: 'Test Machine 3', type: 'Compressor', status: 'active', health_score: 78, last_updated: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      showError('Failed to load machines, using fallback machines');
      
      // Fallback machines in case of API failure
      setMachines([
        { id: 'fallback-1', name: 'Test Machine 1', type: 'Motor', status: 'active', health_score: 85, last_updated: new Date().toISOString() },
        { id: 'fallback-2', name: 'Test Machine 2', type: 'Pump', status: 'active', health_score: 92, last_updated: new Date().toISOString() },
        { id: 'fallback-3', name: 'Test Machine 3', type: 'Compressor', status: 'active', health_score: 78, last_updated: new Date().toISOString() }
      ]);
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
    console.log("processFiles called", { selectedFiles: selectedFiles.length, metadata });
    
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
        console.log(`Uploading file ${i + 1}/${selectedFiles.length}: ${file.name}`);
        
        // Step 1: Upload file directly to backend (which handles Supabase Storage)
        const uploadResult = await uploadAPI.uploadFile(file, {
          machine_id: metadata.machine_id,
          sensor_position: metadata.sensor_position,
          axis: metadata.axis,
          sampling_rate: metadata.sampling_rate
        });
        
        console.log("Upload result:", uploadResult);
        
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
        console.log("Record result:", recordResult);
        
        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], progress: 80, record_id: recordResult.record_id }
        }));

        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], status: 'completed', progress: 100 }
        }));

      } catch (error: any) {
        console.error(`Upload failed for file ${file.name}:`, error);
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
    console.log("processAnalysis called", { uploadStatus });
    setIsProcessing(true);
    
    try {
      const recordIds = Object.values(uploadStatus)
        .filter((status: any) => status.record_id)
        .map((status: any) => status.record_id);
      
      console.log("Record IDs to process:", recordIds);
      
      if (recordIds.length === 0) {
        showError("No records found to process");
        return;
      }
      
      // Process each record
      for (const recordId of recordIds) {
        try {
          console.log(`Analyzing record: ${recordId}`);
          const result = await diagnosisAPI.analyze(recordId);
          console.log(`Analysis result for ${recordId}:`, result);
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
      machine_id: '',
      sensor_position: '',
      axis: '',
      sampling_rate: '',
    });
  };

  const allCompleted = Object.values(uploadStatus).length > 0 && Object.values(uploadStatus).every((s: any) => s.status === 'completed');
  const hasErrors = Object.values(uploadStatus).some((s: any) => s.status === 'error');

  // Debug logging
  console.log('Upload page state:', { 
    machines: machines.length, 
    selectedFiles: selectedFiles.length, 
    metadata,
    isUploading,
    allCompleted 
  });

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
          
          {/* Debug section */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
              <div className="text-xs space-y-1">
                <div>Files selected: {selectedFiles.length}</div>
                <div>Machines loaded: {machines.length}</div>
                <div>Machine ID: "{metadata.machine_id}"</div>
                <div>Sensor Position: "{metadata.sensor_position}"</div>
                <div>Axis: "{metadata.axis}"</div>
                <div>Sampling Rate: "{metadata.sampling_rate}"</div>
                <div>Is Uploading: {isUploading.toString()}</div>
                <div>All Completed: {allCompleted.toString()}</div>
              </div>
              
              {/* Manual test button */}
              <button
                onClick={() => {
                  // Auto-fill form if empty
                  if (!metadata.machine_id && machines.length > 0) {
                    setMetadata(prev => ({ ...prev, machine_id: machines[0].id }));
                  }
                  if (!metadata.sensor_position) {
                    setMetadata(prev => ({ ...prev, sensor_position: 'Drive End' }));
                  }
                  if (!metadata.axis) {
                    setMetadata(prev => ({ ...prev, axis: 'Horizontal' }));
                  }
                  if (!metadata.sampling_rate) {
                    setMetadata(prev => ({ ...prev, sampling_rate: '12000' }));
                  }
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
              >
                Auto-Fill Form
              </button>
              
              <button
                onClick={processFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="mt-2 ml-2 px-3 py-1 bg-green-500 text-white text-xs rounded disabled:bg-gray-400"
              >
                Force Upload (Debug)
              </button>
            </div>
          )}
        </NeumorphicCard>
      </main>
    </div>
  );
}