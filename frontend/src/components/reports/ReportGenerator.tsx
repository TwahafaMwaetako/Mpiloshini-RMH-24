export default function ReportGenerator({ records, machines, onClose }: { records: any[]; machines: any[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
      <div className="w-full max-w-2xl p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff] bg-[var(--neumorphic-bg)]">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Generate Report</h3>
        <p className="text-sm text-gray-600 mb-4">Generate a detailed report for the selected period and machines. This is a placeholder — hook up PDF generation next.</p>
        <div className="flex gap-3 justify-end">
          <button className="rounded-lg px-4 py-2 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]" onClick={onClose}>Close</button>
          <button className="rounded-lg px-4 py-2 text-white bg-[#5a7d9a] shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">Generate</button>
        </div>
      </div>
    </div>
  )
}

