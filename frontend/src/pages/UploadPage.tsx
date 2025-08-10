import { useState } from 'react'

function UploadPage() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className="p-6 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
      <h2 className="text-xl font-semibold mb-4">Upload Vibration Data</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full p-4 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]"
      />
      {file && <p className="mt-3 text-sm">Selected: {file.name}</p>}
    </div>
  )
}

export default UploadPage
