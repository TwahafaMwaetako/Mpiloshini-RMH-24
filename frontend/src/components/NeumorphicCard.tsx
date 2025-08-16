interface Props {
  children: React.ReactNode
  className?: string
}

export default function NeumorphicCard({ children, className }: Props) {
  return (
    <div className={`p-6 rounded-xl neumorphic ${className ?? ''}`}>
      {children}
    </div>
  )
}

