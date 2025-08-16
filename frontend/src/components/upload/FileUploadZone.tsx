interface Props {
  onFileSelect: (files: FileList) => void
}

export default function FileUploadZone({ onFileSelect }: Props) {
  return (
    <div
      className="rounded-xl p-10 text-center cursor-pointer shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]"
    >
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && onFileSelect(e.target.files)}
        className="w-full"
      />
      <p className="text-sm text-gray-600 mt-2">Drag and drop files or click to choose</p>
    </div>
  )
}


