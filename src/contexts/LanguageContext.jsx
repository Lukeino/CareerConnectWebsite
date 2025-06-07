import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('it');

  useEffect(() => {
    // Check if language is saved in localStorage
    const savedLanguage = localStorage.getItem('careerconnect_language');
    if (savedLanguage && ['it', 'en'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (['it', 'en'].includes(browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const changeLanguage = (lang) => {
    if (['it', 'en'].includes(lang)) {
      setCurrentLanguage(lang);
      localStorage.setItem('careerconnect_language', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isItalian: currentLanguage === 'it',
    isEnglish: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
