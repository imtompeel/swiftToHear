import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);

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