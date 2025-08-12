interface Props {
  children: React.ReactNode
  className?: string
}

export default function NeumorphicCard({ children, className }: Props) {
  return (
    <div className={`p-6 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff] ${className ?? ''}`}>
      {children}
    </div>
  )
}
