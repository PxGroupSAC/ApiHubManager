import { ReactNode } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Don't show sidebar on auth page
  const isAuthPage = location === "/auth";
  
  // Only show sidebar when user is authenticated and not on auth page
  const showSidebar = user && !isAuthPage;
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showSidebar && <Sidebar />}
      
      {/* Main content */}
      <main className={`flex-1 overflow-y-auto ${isAuthPage ? 'p-0' : ''}`}>
        {!isAuthPage && (
          <div className="p-6 pb-24">
            {children}
          </div>
        )}
        {isAuthPage && children}
      </main>
    </div>
  );
}
