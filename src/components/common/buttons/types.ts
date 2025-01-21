import { VariantProps } from 'class-variance-authority';
import React from 'react';
import { buttonStyles } from './buttonStyles';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    label: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  };

export type SocialLoginButtonProps = Omit<
  ButtonProps,
  'label' | 'size' | 'color' | 'shadow' | 'disabled'
> & {
  provider: 'kakao' | 'google';
};
