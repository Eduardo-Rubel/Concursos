import { cn } from '../../utils/cn';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  indicatorColor?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  indicatorColor = 'bg-primary',
  className,
  ...props 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div 
      className={cn("w-full bg-surface-hover rounded-full h-2 overflow-hidden", className)} 
      {...props}
    >
      <div 
        className={cn("h-full transition-all duration-500 ease-out", indicatorColor)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
