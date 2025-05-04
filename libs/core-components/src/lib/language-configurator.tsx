import React, { useState, useEffect } from 'react';
import { en, es, ca } from '@dmesmar/i18n';

const languages_en = [
  en.misc.langs.en, en.misc.langs.es, en.misc.langs.ca
];
const languages_es = [
  es.misc.langs.en, es.misc.langs.es, es.misc.langs.ca
];
const languages_ca = [
  ca.misc.langs.en, ca.misc.langs.es, ca.misc.langs.ca
];
const eng = [en.misc.langs.en, es.misc.langs.en, ca.misc.langs.en];
const esp = [en.misc.langs.es, es.misc.langs.es, ca.misc.langs.es];
const cat = [en.misc.langs.ca, es.misc.langs.ca, ca.misc.langs.ca];
type Language = 'en' | 'es' | 'ca';
const langMap = { en, es, ca };

const dropdownWidth = 130;
const buttonWidth = dropdownWidth / 2;

// Create a global variable to store the current language
// Try to load from localStorage if available
let currentLanguageValue: Language = 'es';

// Initialize from localStorage if we're in a browser environment
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('selectedLanguage') as Language;
  if (savedLang && ['en', 'es', 'ca'].includes(savedLang)) {
    currentLanguageValue = savedLang;
  }
}

// Function to get current language
export const getCurrentLanguage = (): Language => {
  // If in browser, check localStorage first for most up-to-date value
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('selectedLanguage') as Language;
    if (savedLang && ['en', 'es', 'ca'].includes(savedLang)) {
      return savedLang;
    }
  }
  return currentLanguageValue;
};

// Function to set the current language from outside the component
export const setCurrentLanguage = (lang: Language): void => {
  currentLanguageValue = lang;
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedLanguage', lang);
  }
  
  // If there's a registered listener, notify it
  if (languageChangeListener) {
    languageChangeListener(lang);
  }
};

// Create a listener mechanism for components interested in language changes
let languageChangeListener: ((lang: Language) => void) | null = null;

export const LanguageConfigurator = () => {
  const [currentLang, setCurrentLang] = useState<Language>(currentLanguageValue);
  const [showList, setShowList] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') as Language;
    if (savedLang && ['en', 'es', 'ca'].includes(savedLang)) {
      setCurrentLang(savedLang);
      currentLanguageValue = savedLang;
    }
  }, []);

  // Register this component as the listener
  useEffect(() => {
    languageChangeListener = setCurrentLang;
    return () => {
      languageChangeListener = null;
    };
  }, []);

  // Update the global variable when state changes
  useEffect(() => {
    currentLanguageValue = currentLang;
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', currentLang);
    }
  }, [currentLang]);

  // Pick language labels for the menu based on currentLang
  let languages: string[];
  if (currentLang === 'en') {
    languages = languages_en;
  } else if (currentLang === 'ca') {
    languages = languages_ca;
  } else {
    languages = languages_es;
  }

  // Helper: match index to language code
  const idxToCode = (idx: number) => (idx === 0 ? 'en' : idx === 1 ? 'es' : 'ca');

  const handleSelect = (language: string) => {
    // Find which language code was picked
    let nextLang: Language | null = null;
    if (cat.includes(language)) {
      nextLang = 'ca';
    } else if (esp.includes(language)) {
      nextLang = 'es';
    } else if (eng.includes(language)) {
      nextLang = 'en';
    }

    if (nextLang && nextLang !== currentLang) {
      // Save to localStorage before reloading
      localStorage.setItem('selectedLanguage', nextLang);
      
      // Reload the page
      window.location.reload();
    }
    
    setShowList(false);
  };

  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      <button
        onClick={() => setShowList(prev => !prev)}
        style={{
          background: isHovered ? '#f3f6fa' : 'grey',
          border: isActive ? '2px solid #5ca9e6' : '2px solid #ccc',
          padding: '2px',
          margin: 0,
          cursor: 'pointer',
          boxShadow: isHovered ? '0px 2px 8px #808080' : '0px 1px 4px #808080',
          transition: 'all 0.15s',
          outline: isActive ? '2px solid #2980ef' : 'none',
          width: buttonWidth,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Select Language"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
      >
        <img
          src={langMap[currentLang].misc.flag}
          alt={`Flag for ${currentLang}`}
          style={{
            height: "32px",
            width: "auto",
            objectFit: 'contain',
            display: 'block',
            filter: isHovered ? 'brightness(0.95) saturate(1.15)' : 'none',
            transform: isActive ? 'scale(0.96)' : isHovered ? 'scale(1.05)' : 'scale(1.0)',
            transition: 'transform 0.12s, filter 0.12s'
          }}
        />
      </button>
      {showList && (
        <ul
          style={{
            position: "absolute",
            left: 0,
            marginTop: 4,
            width: buttonWidth,
            listStyle: "none",
            background: "#808080",
            border: "3px solid #ccc",
            padding: 0,
            zIndex: 1000,
            boxShadow: '0px 2px 12px black'
          }}
        >
          {languages.map((lang, idx) => {
            const langCode = idxToCode(idx); // 'en', 'es', 'ca'
            return (
              <li
                key={lang}
                style={{
                  color: "black",
                  padding: "6px 3px",
                  cursor: "pointer",
                  background: currentLang === langCode ? "#eee" : undefined
                }}
                onClick={() => handleSelect(lang)}
              >
                {lang}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageConfigurator;