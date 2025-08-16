import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function NeumorphicInput(props: Props) {
  return (
    <input
      {...props}
      className={`p-4 rounded-lg neumorphic-inset bg-transparent ${props.className ?? ''}`}
    />
  )
}

