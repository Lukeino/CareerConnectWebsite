import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PlaceholderPage = ({ messageKey }) => {
  const { t } = useLanguage();
  
  return (
    <div className="placeholder-page">
      {t(messageKey)}
    </div>
  );
};

export default PlaceholderPage;
