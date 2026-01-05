import { cn } from '../../lib/utils';

export const Input = ({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  className = '',
  ...props 
}) => {
  const errorClass = error ? 'input-error' : '';
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn('input input-bordered w-full', errorClass, className)}
      {...props}
    />
  );
};
