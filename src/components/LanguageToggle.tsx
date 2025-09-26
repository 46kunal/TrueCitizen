import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    // Cycles through English (en) -> Marathi (mr) -> Hindi (hi) -> English (en)
    let newLang = 'en';
    const currentLang = i18n.language;

    if (currentLang === 'en') {
      newLang = 'mr';
    } else if (currentLang === 'mr') {
      newLang = 'hi'; // <-- Correctly moves from Marathi to Hindi
    } else {
      newLang = 'en'; // <-- Loops back from Hindi to English
    }

    i18n.changeLanguage(newLang);
  };

  // Displays the NEXT language to switch to (what the user will see on the button)
  const currentLangDisplay = i18n.language === 'en' 
    ? 'मराठी' // If current is EN, show Marathi
    : i18n.language === 'mr' 
    ? 'हिंदी' // If current is MR, show Hindi
    : 'EN'; // If current is HI, show EN
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="gap-1.5 h-8 px-3 bg-white/70"
    >
      <Globe className="h-4 w-4" />
      {currentLangDisplay}
    </Button>
  );
};