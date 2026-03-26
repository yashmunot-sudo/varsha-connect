import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationKey, t, detectLanguage } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('vfl-lang') as Language;
    return saved || detectLanguage();
  });

  useEffect(() => {
    localStorage.setItem('vfl-lang', lang);
  }, [lang]);

  const translate = (key: TranslationKey) => t(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
