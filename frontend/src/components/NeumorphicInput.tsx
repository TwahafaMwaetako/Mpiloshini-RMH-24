import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function NeumorphicInput(props: Props) {
  return (
    <input
      {...props}
      className={`p-4 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff] ${props.className ?? ''}`}
    />
  )
}
