'use client';

import { twMerge } from 'tailwind-merge';
import { ButtonProps } from './types';
import { buttonStyles } from './buttonStyles';

const Button: React.FC<ButtonProps> = ({
  size,
  color,
  shadow = 'none',
  disabled = false,
  label,
  className,
  onClick,
  ...props
}) => {
  return (
    <button
      {...props}
      className={twMerge(buttonStyles({ size, color, shadow, disabled }), className)}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
