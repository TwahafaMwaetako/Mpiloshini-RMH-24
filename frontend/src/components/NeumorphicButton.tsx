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
      className={clsx(
        'px-4 py-2 rounded-lg transition-shadow',
        pressed
          ? 'shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]'
          : 'shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]',
        className,
      )}
    >
      {children}
    </button>
  )
}

