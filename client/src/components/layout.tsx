import { ReactNode } from "react";
import Sidebar from "./sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
