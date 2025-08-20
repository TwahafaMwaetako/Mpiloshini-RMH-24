import React, { useState, useEffect } from "react";
import { Machine } from "@/entities/all";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { machineAPI, uploadAPI, vibrationAPI } from "@/services/api";
import { uploadFileToSupabase } from "@/lib/supabase";

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
  const [metadata, setMetadata] = useState({
    machine_id: '',
    sensor_position: '',
    axis: '',
    sampling_rate: '',
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const data = await machineAPI.getAll();
      setMachines(data);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      showError('Failed to load machines');
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
        // Step 1: Upload the file to Supabase Storage
        const { path: storagePath, url: fileUrl } = await uploadFileToSupabase(file);
        
        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], progress: 40 }
        }));

        // Step 2: Create a vibration record in the backend
        const recordData = {
          machine_id: metadata.machine_id,
          file_path: storagePath,
          file_url: fileUrl,
          file_name: file.name,
          sensor_position: metadata.sensor_position,
          axis: metadata.axis,
          sampling_rate: parseInt(metadata.sampling_rate),
          measurement_date: new Date().toISOString(),
        };
        
        await uploadAPI.createVibrationRecord(recordData);
        
        setUploadStatus((prev: any) => ({
          ...prev,
          [i]: { ...prev[i], progress: 80 }
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
        showSuccess("All files processed successfully!");
    } else {
        showError("Some files failed to upload.");
    }
  };

  const resetUpload = () => {
    setSelectedFiles([]);
    setUploadStatus({});
    setMetadata({
      machine_id: '',
      sensor_position: '',
      axis: '',
      sampling_rate: '',
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
                <div className="rounded-xl p-4 text-center shadow-neumorphic-inset">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <p className="font-medium text-green-600">All files uploaded successfully!</p>
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