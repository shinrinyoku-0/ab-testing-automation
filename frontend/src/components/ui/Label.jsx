import { cn } from '../../lib/utils';

export const Label = ({ 
  htmlFor,
  children,
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <label htmlFor={htmlFor} className={cn('label', className)} {...props}>
      <span className="label-text font-bold text-neutral">
        {children}
        {required && <span className="text-error ml-1">*</span>}
      </span>
    </label>
  );
};

export const HelperText = ({ children, error = false, className = '' }) => (
  <label className="label">
    <span className={cn('label-text-alt', error ? 'text-error' : '', className)}>
      {children}
    </span>
  </label>
);

export const Description = ({ children, className = '' }) => (
  <label className="label">
    <span className={cn('label-text-alt opacity-70', className)}>{children}</span>
  </label>
);
