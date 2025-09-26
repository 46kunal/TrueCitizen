import { Home, List, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next"; // [MODIFIED] New Import

interface BottomNavigationProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

// [MODIFIED] Use 'labelKey' instead of hardcoded 'label'
const navItems = [
  { id: "home", labelKey: "home", icon: Home },
  { id: "track", labelKey: "track", icon: List },
  { id: "community", labelKey: "community", icon: User },
  { id: "profile", labelKey: "profile", icon: User }, // Added Profile
];

export const BottomNavigation = ({ activeTab = "home", onNavigate }: BottomNavigationProps) => {
  const { t } = useTranslation(); // [MODIFIED] New Hook
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          // Hide the report item from the main bar
          if (item.id === 'report') return null; 

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full",
                isActive ? "text-primary" : "text-gray-500"
              )}
            >
              <Icon className="h-6 w-6" />
              {/* [MODIFIED] Use translation key */}
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
        {/* The report button remains separate */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 flex flex-col items-center">
             <Button
                key="report"
                onClick={() => onNavigate?.("report")}
                className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                aria-label={t('report')} // [MODIFIED] Translation
              >
                <Plus className="h-8 w-8" />
              </Button>
            {/* [MODIFIED] Use translation key */}
            <span className="text-xs font-medium text-gray-700 mt-1">{t('report')}</span>
        </div>
      </nav>
    </div>
  );
};