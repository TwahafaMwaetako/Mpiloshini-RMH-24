import React from 'react';
import { cn } from '@/lib/utils';

interface NeumorphicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  children,
  onClick,
  className,
  disabled = false,
  variant = 'primary',
}) => {
  const baseClasses =
    'flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-subtle focus:ring-offset-2 focus:ring-offset-soft-light-gray';
  
  const variantClasses = {
    primary: 'bg-soft-light-gray text-text-dark-gray shadow-neumorphic-extrude hover:shadow-neumorphic-extrude-sm active:shadow-neumorphic-inset disabled:opacity-50 disabled:shadow-neumorphic-inset',
    secondary: 'bg-transparent text-text-body hover:bg-gray-200/50 active:bg-gray-300/50 disabled:opacity-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </button>
  );
};

export default NeumorphicButton;