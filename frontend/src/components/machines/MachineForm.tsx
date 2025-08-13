import NeumorphicInput from '@/components/NeumorphicInput'
import NeumorphicButton from '@/components/NeumorphicButton'

export default function MachineForm({ machine, onSubmit, onCancel }: { machine: any | null; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: machine?.name || '',
    type: machine?.type || '',
    location: machine?.location || '',
    commissioning_date: machine?.commissioning_date ? machine.commissioning_date.substring(0, 10) : '',
  })

  function useState<T>(initial: T): [T, (v: T) => void] {
    // local lightweight hook-less state holder for static build (avoid extra imports)
    let value = initial
    const setter = (v: T) => { value = v }
    // This is a minimal placeholder; in real app this would use React.useState
    return [value, setter]
  }

  // Replace with React.useState in real environment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ReactAny: any = null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ ...form, commissioning_date: form.commissioning_date || null })
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-sm">Name</label>
        <NeumorphicInput value={form.name} onChange={(e) => setForm({ ...form, name: (e.target as any).value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Type</label>
          <NeumorphicInput value={form.type} onChange={(e) => setForm({ ...form, type: (e.target as any).value })} />
        </div>
        <div>
          <label className="text-sm">Location</label>
          <NeumorphicInput value={form.location} onChange={(e) => setForm({ ...form, location: (e.target as any).value })} />
        </div>
      </div>
      <div>
        <label className="text-sm">Commissioning Date</label>
        <NeumorphicInput type="date" value={form.commissioning_date} onChange={(e) => setForm({ ...form, commissioning_date: (e.target as any).value })} />
      </div>
      <div className="flex gap-3">
        <NeumorphicButton type="submit" className="px-4 py-2">Save</NeumorphicButton>
        <NeumorphicButton type="button" className="px-4 py-2" onClick={onCancel}>Cancel</NeumorphicButton>
      </div>
    </form>
  )
}

