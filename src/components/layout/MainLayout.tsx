
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import RealTimeNotifications from '@/components/notifications/RealTimeNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAuth();
  
  // When component mounts, add animations to children but with proper timing
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      const childElements = mainContent.querySelectorAll(':scope > *');
      
      childElements.forEach((element, index) => {
        // Add fade-in animation with staggered delay but ensure visibility
        if (element instanceof HTMLElement) {
          element.style.opacity = '0';
          element.style.animationDelay = `${index * 100}ms`;
          element.style.animationDuration = '500ms';
          element.style.animationFillMode = 'forwards';
          element.classList.add('animate-fade-in');
          
          // Ensure element becomes visible after animation
          setTimeout(() => {
            element.style.opacity = '1';
          }, (index * 100) + 500);
        }
      });
    }
  }, [children]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Real-time notifications (only when authenticated) */}
        {isAuthenticated && <RealTimeNotifications />}
        
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 bg-background text-foreground overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default MainLayout;
