import { cn } from '../../lib/utils';

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
  };

  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  return (
    <button
      disabled={disabled}
      className={cn('btn btn-soft', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
