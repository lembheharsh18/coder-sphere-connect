
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ConversationsList from '@/components/messages/ConversationsList';
import MessageThread from '@/components/messages/MessageThread';
import { Conversation } from '@/types/messages';

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  return (
    <MainLayout>
      <div className="container h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]">
        <div className="flex h-full rounded-lg overflow-hidden border">
          <div className="w-full md:w-1/3 lg:w-1/4 border-r">
            <ConversationsList 
              activeConversationId={activeConversation?.id} 
              onSelectConversation={setActiveConversation}
            />
          </div>
          <div className="hidden md:block md:w-2/3 lg:w-3/4">
            <MessageThread conversation={activeConversation} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
