import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LoadingScreen = () => {
  const { t } = useLanguage();
  
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>{t('common.loadingApp')}</p>
    </div>
  );
};

export default LoadingScreen;
