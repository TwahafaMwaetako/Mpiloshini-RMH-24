import React from 'react'
import { Machine, VibrationRecord } from '@/entities/all'
import { UploadFile } from '@/integrations/Core'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

import FileUploadZone from '@/components/upload/FileUploadZone'
import UploadProgress from '@/components/upload/UploadProgress'
import MetadataForm from '@/components/upload/MetadataForm'

export default function UploadPage() {
  const [machines, setMachines] = React.useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [uploadStatus, setUploadStatus] = React.useState<Record<number, { progress: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string | null }>>({})
  const [isUploading, setIsUploading] = React.useState(false)
  const [metadata, setMetadata] = React.useState({
    machine_id: '',
    sensor_position: '',
    axis: '',
    sampling_rate: '',
    duration: '',
  })

  React.useEffect(() => {
    loadMachines()
  }, [])

  const loadMachines = async () => {
    try {
      const data = await Machine.list('-created_at')
      setMachines(data)
    } catch (error) {
      console.error('Error loading machines:', error)
    }
  }

  const handleFileSelect = (files: FileList) => {
    const fileList = Array.from(files)
    setSelectedFiles(fileList)
    const status: Record<number, { progress: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string | null }> = {}
    fileList.forEach((_, index) => {
      status[index] = { progress: 0, status: 'pending', error: null }
    })
    setUploadStatus(status)
  }

  const processFiles = async () => {
    if (selectedFiles.length === 0 || !metadata.machine_id) return
    setIsUploading(true)
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadStatus((prev) => ({ ...prev, [i]: { ...prev[i], status: 'uploading', progress: 10 } }))
        try {
          const { file_url, file_path } = await UploadFile({ file })
          setUploadStatus((prev) => ({ ...prev, [i]: { ...prev[i], progress: 60 } }))
          await VibrationRecord.create({
            machine_id: metadata.machine_id,
            file_name: file.name,
            file_url,
            file_path,
            sampling_rate: Number(metadata.sampling_rate) || null,
            duration: Number(metadata.duration) || null,
            timestamp: new Date().toISOString(),
          })
          setUploadStatus((prev) => ({ ...prev, [i]: { ...prev[i], status: 'completed', progress: 100 } }))
        } catch (err: any) {
          setUploadStatus((prev) => ({ ...prev, [i]: { ...prev[i], status: 'error', error: err?.message || 'Upload failed' } }))
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFiles([])
    setUploadStatus({})
    setMetadata({ machine_id: '', sensor_position: '', axis: '', sampling_rate: '', duration: '' })
  }

  const allCompleted = Object.values(uploadStatus).length > 0 && Object.values(uploadStatus).every((s) => s.status === 'completed')
  const hasErrors = Object.values(uploadStatus).some((s) => s.status === 'error')

  return (
    <div className="p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Vibration Data</h1>
        <p className="text-gray-600">Upload vibration files for analysis and fault detection</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" /> File Upload
          </h2>
          {selectedFiles.length === 0 ? (
            <FileUploadZone onFileSelect={handleFileSelect} />
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl p-4 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                <h3 className="font-semibold text-gray-800 mb-3">Selected Files</h3>
                <UploadProgress files={selectedFiles} uploadStatus={uploadStatus} />
              </div>
              {allCompleted && (
                <div className="rounded-xl p-4 text-center shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">All files uploaded successfully!</p>
                </div>
              )}
              {hasErrors && (
                <div className="rounded-xl p-4 text-center shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">Some files failed to upload</p>
                </div>
              )}
              <button onClick={resetUpload} className="w-full rounded-lg px-4 py-2 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
                Upload New Files
              </button>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Measurement Details
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
        </div>
      </div>
    </div>
  )
}
