
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Card3DProps extends React.ComponentPropsWithRef<typeof Card> {
  maxRotation?: number;
  className?: string;
  childrenClassName?: string;
  children: React.ReactNode;
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ className, children, maxRotation = 10, childrenClassName, ...props }, ref) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isHovering) return;
      
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      
      // Get mouse position relative to card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Convert to percentage (-1 to 1)
      const rotateY = ((x - centerX) / centerX) * maxRotation;
      const rotateX = ((centerY - y) / centerY) * maxRotation;
      
      setRotation({ x: rotateX, y: rotateY });
    };
    
    const handleMouseEnter = () => {
      setIsHovering(true);
    };
    
    const handleMouseLeave = () => {
      setIsHovering(false);
      setRotation({ x: 0, y: 0 });
    };

    return (
      <div 
        className={cn('perspective-1000 cursor-pointer', className)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <Card
          className={cn(
            'transform-style-3d transition-transform duration-200',
            childrenClassName
          )}
          style={{ 
            transform: isHovering 
              ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
              : 'rotateX(0) rotateY(0)',
            transition: isHovering ? 'none' : 'transform 0.5s ease-out'
          }}
          ref={ref}
          {...props}
        >
          {children}
        </Card>
      </div>
    );
  }
);

Card3D.displayName = 'Card3D';

export { Card3D };
