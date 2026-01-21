
import React from 'react';
import { Bot, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onReset: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onReset, 
  isFullScreen, 
  toggleFullScreen 
}) => {
  return (
    <CardHeader className="px-4 py-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          Code Assistant
        </CardTitle>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onReset}
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit full screen" : "Full screen"}
          >
            {isFullScreen ? 
              <Minimize className="h-4 w-4" /> : 
              <Maximize className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
