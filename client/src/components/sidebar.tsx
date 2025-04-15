import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, LayoutDashboard, TerminalSquare, BarChart3, User, LogOut } from "lucide-react";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [expanded, setExpanded] = useState<boolean>(false);
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Applications", href: "/applications", icon: Code },
    { name: "Statistics", href: "/statistics", icon: BarChart3 },
    { name: "My Account", href: "/account", icon: User },
  ];
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  const toggleSidebar = () => {
    setExpanded(!expanded);
  };
  
  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logging out...");
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-20 p-4">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          <TerminalSquare className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Sidebar */}
      <aside className={`bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen flex-shrink-0 transition-all duration-300 ${expanded ? "fixed inset-0 z-50 md:relative md:z-0" : "hidden md:block"} w-64`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
                <Code className="h-5 w-5" />
              </div>
              <span className="ml-2 text-lg font-semibold">API Manager</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive(item.href) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                onClick={() => {
                  setLocation(item.href);
                  if (expanded) setExpanded(false);
                }}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
