import { useTranslation as useI18nTranslation } from 'react-i18next';

// Utility function to resolve shared component references
const resolveSharedComponents = (value: string, t: (key: string) => string): string => {
  if (typeof value !== 'string') return value;
  
  // Match patterns like {{shared.roles.speaker}}
  const sharedPattern = /\{\{shared\.([^}]+)\}\}/g;
  
  return value.replace(sharedPattern, (match, path) => {
    const fullPath = `shared.${path}`;
    return t(fullPath) || match;
  });
};

export const useTranslation = (namespace?: string) => {
  const { t: originalT, i18n } = useI18nTranslation(namespace);

  // Enhanced translation function that handles shared component interpolation
  const t = (key: string, options?: any): string => {
    const value = originalT(key, options);
    return resolveSharedComponents(value, originalT);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return ['en', 'es', 'fr'];
  };

  const getLanguageNames = () => {
    return {
      en: 'English',
      es: 'Español', 
      fr: 'Français'
    };
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    getLanguageNames,
    isLoading: !i18n.isInitialized
  };
};