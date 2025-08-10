function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-6 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
        <h3 className="font-semibold mb-2">Summary</h3>
        <p>Health indices, alerts, and recent uploads will appear here.</p>
      </div>
      <div className="p-6 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
        <h3 className="font-semibold mb-2">Recent Diagnostics</h3>
        <p>Latest records and statuses.</p>
      </div>
    </div>
  )
}

export default DashboardPage
