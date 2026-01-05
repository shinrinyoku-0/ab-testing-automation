import { cn } from '../../lib/utils'

export const Card = ({ 
  children, 
  className = '',
  hover = false,
  onClick,
  ...props 
}) => {
  const hoverClass = hover || onClick ? 'hover:shadow-xl transition-shadow cursor-pointer' : '';
  
  return (
    <div
      onClick={onClick}
      className={cn('card bg-base-100 shadow-xl', hoverClass, className)}
      {...props}
    >
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h2 className={cn('card-title', className)}>{children}</h2>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={cn('text-sm opacity-70', className)}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={cn('card-actions justify-end mt-4', className)}>{children}</div>
);
