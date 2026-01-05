import { cn } from '../../lib/utils';

export const Alert = ({ 
  variant = 'info',
  children,
  className = '',
  ...props 
}) => {
  const daisyVariants = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error'
  };

  return (
    <div
      role="alert"
      className={cn('alert alert-soft', daisyVariants[variant], className)}
      {...props}
    >
      <span>{children}</span>
    </div>
  );
};
