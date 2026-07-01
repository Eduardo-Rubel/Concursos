import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  fullWidth, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-95",
        {
          'bg-primary text-white hover:bg-primary/90': variant === 'primary',
          'bg-surface-hover text-foreground border border-border hover:border-muted': variant === 'secondary',
          'bg-danger text-white hover:bg-danger/90': variant === 'danger',
          'hover:bg-surface-hover text-muted hover:text-foreground': variant === 'ghost',
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 py-2 text-sm': size === 'md',
          'h-12 px-8 text-base': size === 'lg',
          'w-full': fullWidth,
        },
        className
      )}
      {...props}
    />
  );
}
