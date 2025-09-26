import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface MobileLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export const MobileLayout = ({ children, activeTab, onNavigate }: MobileLayoutProps) => {
  return (
    // The wrapper is now relative and takes the full height of its container
    <div className="relative h-full gradient-background">
      {/* The main content area now correctly fills the space above the nav bar */}
      <main className="h-full overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNavigation activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
};