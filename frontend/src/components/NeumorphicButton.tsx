import { useState } from 'react'
import clsx from 'classnames'

interface Props {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function NeumorphicButton({ onClick, children, className, type = 'button' }: Props) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      type={type}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      className={clsx('px-4 py-2 rounded-lg transition-shadow', pressed ? 'neumorphic-pressed' : 'neumorphic', className)}
    >
      {children}
    </button>
  )
}

