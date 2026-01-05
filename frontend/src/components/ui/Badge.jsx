import { cn } from '../../lib/utils';

export const Badge = ({ 
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props 
}) => {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    primary: 'badge-primary',
    secondary: 'badge-secondary'
  };

  const sizes = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg'
  };

  return (
    <span className={cn('badge badge-soft', variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
