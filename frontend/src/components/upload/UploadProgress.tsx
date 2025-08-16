import React from 'react';
import { FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadStatus {
  [key: number]: {
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error: string | null;
  };
}

interface UploadProgressProps {
  files: File[];
  uploadStatus: UploadStatus;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ files, uploadStatus }) => {
  return (
    <ul className="space-y-3">
      {files.map((file, index) => {
        const status = uploadStatus[index] || { progress: 0, status: 'pending', error: null };
        const isCompleted = status.status === 'completed';
        const isError = status.status === 'error';
        const isUploading = status.status === 'uploading';

        return (
          <li key={index} className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : isError ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-accent-subtle" />
              ) : (
                <FileText className="h-6 w-6 text-text-body" />
              )}
            </div>
            <div className="flex-1">
              <p className="truncate text-sm font-medium text-text-dark-gray">{file.name}</p>
              <Progress value={status.progress} className="mt-1 h-1.5" />
              {isError && <p className="mt-1 text-xs text-red-500">{status.error}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default UploadProgress;