
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Message } from './types';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { mockAIRequest, buildConversationHistory } from './chatUtils';

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI coding assistant powered by Gemini. Ask me anything about programming, web development, algorithms, or competitive coding!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleSendMessage = async (inputMessage: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    
    try {
      // Build conversation history for context
      const conversationHistory = buildConversationHistory(updatedMessages);
      
      // Call AI with conversation context
      const aiResponse = await mockAIRequest(inputMessage, conversationHistory);
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        content: "Sorry, I couldn't process your request. Please check your API key configuration or try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your coding assistant. Ask me anything about programming, web development, or the platform!',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <Card className={`flex flex-col shadow-sm transition-all duration-300 ${
      isFullScreen ? 'fixed top-16 left-4 right-4 bottom-4 md:top-20 md:left-1/4 md:right-1/4 md:bottom-20 z-50 rounded-md' : 'h-full'
    }`}>
      <ChatHeader 
        onReset={handleReset} 
        isFullScreen={isFullScreen} 
        toggleFullScreen={toggleFullScreen} 
      />
      <CardContent className="p-0 flex-1 flex flex-col">
        <ChatMessages 
          messages={messages}
          isLoading={isLoading}
        />
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </CardContent>
      {isFullScreen && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10" 
          onClick={toggleFullScreen}
          aria-hidden="true"
        ></div>
      )}
    </Card>
  );
};

export default AIChatbot;
