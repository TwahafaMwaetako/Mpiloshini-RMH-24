interface Props {
  files: File[]
  uploadStatus: Record<number, { progress: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string | null }>
}

export default function UploadProgress({ files, uploadStatus }: Props) {
  return (
    <div className="space-y-3">
      {files.map((file, idx) => {
        const st = uploadStatus[idx] || { progress: 0, status: 'pending' }
        return (
          <div key={idx} className="p-3 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{file.name}</span>
              <span>{st.status}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#e6e6e6]">
              <div
                className="h-2 rounded-full bg-[#5a7d9a]"
                style={{ width: `${Math.min(100, Math.max(0, st.progress))}%` }}
              />
            </div>
            {st.error && <p className="text-xs text-red-600 mt-1">{st.error}</p>}
          </div>
        )
      })}
    </div>
  )
}


