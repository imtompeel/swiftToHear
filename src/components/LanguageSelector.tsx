import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSelector: React.FC = () => {
  const { changeLanguage, getCurrentLanguage, getAvailableLanguages, getLanguageNames } = useTranslation();
  const currentLang = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();
  const languageNames = getLanguageNames();

  return (
    <div className="relative">
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent border border-secondary-300 rounded-md px-3 py-1 text-sm text-secondary-700 hover:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        aria-label="Select language"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang} className="bg-white text-secondary-900">
            {languageNames[lang as keyof typeof languageNames]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;