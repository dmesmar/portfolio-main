import React, { useState, useEffect, useRef } from 'react';
import { en, es, ca } from '@dmesmar/i18n';

const languages_en = [en.misc.langs.en, en.misc.langs.es, en.misc.langs.ca];
const languages_es = [es.misc.langs.en, es.misc.langs.es, es.misc.langs.ca];
const languages_ca = [ca.misc.langs.en, ca.misc.langs.es, ca.misc.langs.ca];

type Language = 'en' | 'es' | 'ca';

const codeMap: Record<Language, string> = { en: "EN", es: "ES", ca: "CA" };
const colorMap: Record<Language, string> = { en: "#249d54", es: "#e99d22", ca: "#387cc7" };

let currentLanguageValue: Language = 'es';
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('selectedLanguage') as Language;
  if (savedLang && ['en', 'es', 'ca'].includes(savedLang)) {
    currentLanguageValue = savedLang;
  }
}

export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('selectedLanguage') as Language;
    if (savedLang && ['en', 'es', 'ca'].includes(savedLang)) return savedLang;
  }
  return currentLanguageValue;
};
export const setCurrentLanguage = (lang: Language): void => {
  currentLanguageValue = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedLanguage', lang);
  }
  if (languageChangeListener) {
    languageChangeListener(lang);
  }
};

// Listener
let languageChangeListener: ((lang: Language) => void) | null = null;

// Bajo globo SVG
const Globe = ({ active }: { active: boolean }) => (
  <svg
    width="30"
    height="30"
    className="langc__globe"
    style={{
      filter: active ? 'drop-shadow(0 0 7px #2a80ff)' : undefined,
    }}
    viewBox="0 0 44 44"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="22" cy="22" r="18" fill="#92c6f5" stroke="#2C6BCF" strokeWidth="2" />
    <ellipse cx="15.5" cy="21" rx="4.8" ry="3.6" fill="#5CB85C" opacity="0.7" />
    <ellipse cx="29" cy="14" rx="2.5" ry="2" fill="#5CB85C" opacity="0.65" />
    <ellipse cx="29" cy="26.5" rx="5" ry="2.1" fill="#5CB85C" opacity="0.62" />
    <ellipse cx="22" cy="32" rx="1.7" ry="1" fill="#5CB85C" opacity="0.7" />
    <ellipse cx="22" cy="22" rx="18" ry="18" fill="none" stroke="#41a0db" strokeWidth={active ? 2 : 1.1} opacity="0.54" />
  </svg>
);

export const LanguageConfigurator = () => {
  const [currentLang, setCurrentLang] = useState<Language>(currentLanguageValue);
  const [showList, setShowList] = useState(false);
  const [hover, setHover] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!showList) return;
    function onClick(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setShowList(false);
      }
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [showList]);

  let languages: string[];
  if (currentLang === 'en') languages = languages_en;
  else if (currentLang === 'ca') languages = languages_ca;
  else languages = languages_es;

  const available: { code: Language; label: string }[] = [
    { code: 'en', label: languages[0] },
    { code: 'es', label: languages[1] },
    { code: 'ca', label: languages[2] },
  ];

  const handleSelect = (lang: Language) => {
    if (lang !== currentLang) {
      localStorage.setItem('selectedLanguage', lang);
      window.location.reload();
    }
    setShowList(false);
  };

  return (
    <div className="langc">
      <button
        ref={btnRef}
        aria-label="Select Language"
        tabIndex={0}
        className={`langc__button${showList ? ' langc__button--active' : ''}`}
        onClick={() => setShowList(s => !s)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Globe active={hover || showList} />
        <span
          className="langc__sticker"
          style={{ background: colorMap[currentLang] }}
        >
          {codeMap[currentLang]}
        </span>
      </button>
      {showList && (
        <ul
          ref={listRef}
          className="langc__menu"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowList(false);
          }}
        >
          {available.map(({ code, label }) => (
            <li
              key={code}
              className={`langc__item${currentLang === code ? ' langc__item--active' : ''}`}
              aria-current={currentLang === code ? "true" : undefined}
              onClick={() => handleSelect(code)}
              tabIndex={0}
            >
              <span
                className="langc__item-sticker"
                style={{
                  color: colorMap[code],
                  borderColor: colorMap[code]
                }}
              >
                {codeMap[code]}
              </span>
              <span>{label}</span>
              {currentLang === code && (
                <span className="langc__item-tick">✓</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageConfigurator;