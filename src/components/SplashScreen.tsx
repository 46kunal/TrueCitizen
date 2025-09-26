import { useEffect } from "react";
import trueCitizenLogo from "@/assets/remove all white bac.png";
import { useTranslation } from "react-i18next"; // [MODIFIED] New Import

export const SplashScreen = ({ onContinue }: { onContinue: () => void }) => {
  const { t } = useTranslation(); // [MODIFIED] New Hook

  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2000); // Auto-continue after 2 seconds
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-4">
        {/* Using the existing logo, as I cannot create a new one */}
        <div className="w-32 h-32 mx-auto">
          <img 
            src={trueCitizenLogo} 
            alt="TrueCitizen Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="space-y-2">
          {/* [MODIFIED] Translate Title and Slogan */}
          <h1 className="text-4xl font-bold text-primary-foreground tracking-wider">{t('appTitle')}</h1>
          <p className="text-md text-foreground">
            {t('slogan')}
          </p>
        </div>
      </div>
    </div>
  );
};