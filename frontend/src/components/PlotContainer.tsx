interface Props {
  title: string
  children: React.ReactNode
}

export default function PlotContainer({ title, children }: Props) {
  return (
    <div className="p-6 rounded-xl shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  )
}

