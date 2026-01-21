
import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface Button3DProps extends ButtonProps {
  depth?: number;
  hoverScale?: boolean;
  className?: string;
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, children, depth = 4, hoverScale = true, ...props }, ref) => {
    return (
      <div className={cn('relative perspective-1000 group', className)}>
        <Button
          className={cn(
            'relative z-10 transition-all duration-300',
            hoverScale && 'group-hover:scale-105',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Button>
        <span 
          className="absolute inset-0 bg-primary/30 rounded-md transform-style-3d transition-all duration-300 group-hover:-translate-y-1 group-active:translate-y-0 group-hover:translate-z-0 group-active:translate-z-0"
          style={{ transform: `translateZ(-${depth}px)` }}
        />
      </div>
    );
  }
);

Button3D.displayName = 'Button3D';

export { Button3D };
