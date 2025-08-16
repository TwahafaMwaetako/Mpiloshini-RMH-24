import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileSelect(acceptedFiles);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "audio/wav": [".wav"],
      "application/octet-stream": [".tdms"],
      "application/x-matlab-data": [".mat"],
      "application/x-mdf": [".mdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-soft-light-gray p-12 text-center transition-colors duration-200 hover:border-accent-subtle hover:bg-gray-200/50",
        isDragActive ? "border-accent-subtle bg-gray-200/50" : ""
      )}
    >
      <input {...getInputProps()} />
      <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
        <UploadCloud className="h-12 w-12 text-accent-subtle" />
      </div>
      <p className="mt-4 font-semibold text-text-dark-gray">
        {isDragActive ? "Drop files here" : "Drag & drop files or click to browse"}
      </p>
      <p className="mt-2 text-sm text-text-body">
        Supported formats: CSV, WAV, TDMS, MAT, MDF
      </p>
    </div>
  );
};

export default FileUploadZone;